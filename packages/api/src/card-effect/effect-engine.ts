import type {
  EffectAction,
  EffectCardFilter,
  EffectCondition,
  EffectDecisionResponse,
  EffectKeyword,
  EffectOwnerSelector,
  EffectTargetSelector,
  PendingEffectDecision,
  StandardEffectDefinition,
} from '@onepiecetcg/shared';
import { DuelCard, type DuelPlayer, type DuelState } from '@onepiecetcg/shared';
import type { EffectRegistry } from './types/effect-registry';

export type EffectEventType =
  | 'onPlay'
  | 'activateCounter'
  | 'onEventActivated'
  | 'whenAttacking'
  | 'onKo'
  | 'trigger'
  | 'onBlock'
  | 'onTurnStart'
  | 'onTurnEnd'
  | 'activateMain';

export type EffectEvent = {
  type: EffectEventType;
  playerSessionId: string;
  sourceInstanceId: string;
  sourceCardId: string;
};

export type ReplacementQuery = {
  type: 'wouldKoCharacter';
  playerSessionId: string;
  sourceInstanceId: string;
  reason: 'battle' | 'effect';
};

type RuntimeModifier = {
  sourceInstanceId: string;
  targetInstanceId: string;
  amount: number;
  expiresAtEndOfTurn: boolean;
  expiresAtEndOfBattle: boolean;
};

type RuntimeKeywordModifier = {
  sourceInstanceId: string;
  targetInstanceId: string;
  keywords: EffectKeyword[];
  expiresAtEndOfTurn: boolean;
  expiresAtEndOfBattle: boolean;
};

type QueuedEffect = {
  controllerSessionId: string;
  sourceInstanceId: string;
  sourceCardId: string;
  definition: StandardEffectDefinition;
};

type PendingDecisionState = {
  decision: PendingEffectDecision;
  continuation: (response: EffectDecisionResponse) => void;
};

type EffectResolutionContext = {
  storedSelections: Record<string, DuelCard[]>;
};

/**
 * Host adapter used by the effect engine so the duel room remains the
 * Colyseus/network boundary while gameplay resolution stays testable.
 */
export interface EffectEngineHost {
  state: DuelState;
  addLog(message: string): void;
  getPlayer(sessionId: string): DuelPlayer | undefined;
  getOpponentSessionId(sessionId: string): string | null;
  getCard(instanceId: string): DuelCard | null;
  getCards(selector: EffectTargetSelector, controllerSessionId: string): DuelCard[];
  moveCard(
    card: DuelCard,
    destinationPlayerSessionId: string,
    destinationZone: string,
    options?: { faceDown?: boolean; rested?: boolean },
  ): void;
  shuffleDeck(playerSessionId: string): void;
  drawCard(playerSessionId: string): DuelCard | null;
  trashTopDeckCards(playerSessionId: string, amount: number): DuelCard[];
  addDonToCost(playerSessionId: string, amount: number, rested: boolean): number;
  attachDon(
    playerSessionId: string,
    targetInstanceId: string,
    amount: number,
    options?: { rested?: boolean },
  ): number;
  returnDonToDonDeck(playerSessionId: string, amount: number): number;
  koCharacter(
    playerSessionId: string,
    instanceId: string,
    reason: 'battle' | 'effect',
  ): boolean;
  syncPlayer(playerSessionId: string): void;
}

/**
 * Pure server-side automatic effect resolver for the authoritative duel room.
 */
export class EffectEngine {
  private readonly queue: QueuedEffect[] = [];

  private readonly modifiers: RuntimeModifier[] = [];

  private readonly keywordModifiers: RuntimeKeywordModifier[] = [];

  private readonly resolvedOncePerTurnKeys = new Set<string>();

  private pendingDecisionState: PendingDecisionState | null = null;

  public constructor(
    private readonly registry: EffectRegistry,
    private readonly host: EffectEngineHost,
  ) {}

  /** Serializes the pending player choice, if the resolver is paused on one. */
  public getPendingDecision(): PendingEffectDecision | null {
    return this.pendingDecisionState?.decision ?? null;
  }

  /** Recomputes visible power from printed power plus active continuous modifiers. */
  public reapplyContinuousEffects(): void {
    const players = Array.from(this.host.state.players.values());

    for (const player of players) {
      for (const card of this.collectPlayerCards(player)) {
        const baseCost = Number.isFinite(card.baseCost)
          ? card.baseCost
          : Number.isFinite(card.cost)
            ? card.cost
            : -1;
        card.baseCost = baseCost;
        card.cost = baseCost;
        card.power = card.basePower;
        card.hasRush = false;
        card.hasDoubleAttack = false;
        card.hasBanish = false;
        card.canAttackActiveCharacters = false;
        card.mustBeAttackTarget = false;
        card.cannotBlock = false;
        card.cannotBeKoedInBattle = false;
        card.cannotBeKoedByStrikeInBattle = false;
      }
    }

    for (const card of this.collectInPlayCards()) {
      const definition = this.registry.effectsByCardId[card.cardId];

      for (const continuous of definition?.continuous ?? []) {
        if (!this.conditionsPass(continuous.conditions ?? [], card.ownerSessionId, card)) {
          continue;
        }

        for (const target of this.host.getCards(
          continuous.modifier.selector,
          card.ownerSessionId,
        )) {
          if (continuous.modifier.power) {
            target.power += continuous.modifier.power;
          }

          if (continuous.modifier.cost) {
            target.cost = Number.isFinite(target.cost)
              ? target.cost
              : Number.isFinite(target.baseCost)
                ? target.baseCost
                : -1;
            target.cost += continuous.modifier.cost;
          }

          if (continuous.modifier.powerPerCount) {
            const count = this.host.getCards(
              continuous.modifier.powerPerCount.selector,
              card.ownerSessionId,
            ).length;
            const divisor = Math.max(1, continuous.modifier.powerPerCount.divisor ?? 1);
            target.power +=
              Math.floor(count / divisor) *
              continuous.modifier.powerPerCount.amount;
          }

          if (continuous.modifier.keywords) {
            this.applyKeywords(target, continuous.modifier.keywords);
          }
        }
      }
    }

    for (const modifier of this.modifiers) {
      const target = this.host.getCard(modifier.targetInstanceId);

      if (target) {
        target.power += modifier.amount;
      }
    }

    for (const modifier of this.keywordModifiers) {
      const target = this.host.getCard(modifier.targetInstanceId);

      if (target) {
        this.applyKeywords(target, modifier.keywords);
      }
    }

    for (const player of players) {
      for (const card of this.collectPlayerCards(player)) {
        if (card.cost >= 0) {
          card.cost = Math.max(card.cost, 0);
        }
      }
    }
  }

  /** Removes temporary end-of-turn modifiers and refreshes derived values. */
  public clearTurnModifiers(): void {
    const kept = this.modifiers.filter((modifier) => !modifier.expiresAtEndOfTurn);
    this.modifiers.splice(0, this.modifiers.length, ...kept);
    const keptKeywords = this.keywordModifiers.filter(
      (modifier) => !modifier.expiresAtEndOfTurn,
    );
    this.keywordModifiers.splice(0, this.keywordModifiers.length, ...keptKeywords);
    this.reapplyContinuousEffects();
  }

  /** Removes temporary end-of-battle modifiers and refreshes derived values. */
  public clearCombatModifiers(): void {
    const kept = this.modifiers.filter(
      (modifier) => !modifier.expiresAtEndOfBattle,
    );
    this.modifiers.splice(0, this.modifiers.length, ...kept);
    const keptKeywords = this.keywordModifiers.filter(
      (modifier) => !modifier.expiresAtEndOfBattle,
    );
    this.keywordModifiers.splice(0, this.keywordModifiers.length, ...keptKeywords);
    this.reapplyContinuousEffects();
  }

  /** Queues and resolves all standard effects matching a gameplay event. */
  public handleEvent(event: EffectEvent): void {
    const source = this.host.getCard(event.sourceInstanceId);

    if (!source) {
      return;
    }

    this.queueTriggeredEffectsForCard(event, source, event.playerSessionId);

    for (const candidate of this.collectInPlayCards()) {
      if (candidate.instanceId === source.instanceId) {
        continue;
      }

      this.queueTriggeredEffectsForCard(
        event,
        candidate,
        candidate.ownerSessionId,
      );
    }

    this.registry.specialHandlersByCardId[event.sourceCardId]?.resolve(
      event,
      this,
    );

    this.flushQueue();
  }

  /** Checks whether a replacement effect cancels or rewrites a pending KO event. */
  public applyReplacement(query: ReplacementQuery): boolean {
    const source = this.host.getCard(query.sourceInstanceId);

    if (!source) {
      return false;
    }

    const effects = this.registry.replacementEffectsByEventType[
      query.type
    ].filter((entry) => entry.cardId === source.cardId);

    for (const { effect } of effects) {
      if (!this.conditionsPass(effect.conditions ?? [], query.playerSessionId, source)) {
        continue;
      }

      this.host.addLog(`${source.name} applique un effet de remplacement.`);
      this.resolveActions(effect.replacement, query.playerSessionId, source);
      return true;
    }

    return false;
  }

  /** Resumes a paused effect after a player answers the pending decision. */
  public answerDecision(response: EffectDecisionResponse): void {
    if (!this.pendingDecisionState) {
      return;
    }

    if (this.pendingDecisionState.decision.id !== response.decisionId) {
      return;
    }

    const continuation = this.pendingDecisionState.continuation;
    this.pendingDecisionState = null;
    continuation(response);
    this.flushQueue();
  }

  /** Enqueues a one-off effect directly; used by special handlers. */
  public queueEffect(
    controllerSessionId: string,
    sourceInstanceId: string,
    sourceCardId: string,
    definition: StandardEffectDefinition,
  ): void {
    this.queue.push({
      controllerSessionId,
      sourceInstanceId,
      sourceCardId,
      definition,
    });
  }

  private flushQueue(): void {
    while (this.queue.length > 0 && !this.pendingDecisionState) {
      const queued = this.queue.shift();

      if (!queued) {
        continue;
      }

      const source = this.host.getCard(queued.sourceInstanceId);

      if (!source) {
        continue;
      }

      if (queued.definition.trigger.optional) {
        const decisionId = `${queued.sourceInstanceId}:${queued.definition.id}:optional`;
        this.pendingDecisionState = {
          decision: {
            id: decisionId,
            effectId: queued.definition.id,
            effectCardId: queued.sourceCardId,
            sourceInstanceId: queued.sourceInstanceId,
            playerSessionId: queued.controllerSessionId,
            createdAt: new Date().toISOString(),
            prompt: {
              type: 'confirm',
              message: `${source.name}: activer l'effet optionnel ?`,
              optional: true,
            },
          },
          continuation: (response) => {
            if (response.confirmed) {
              this.resolveStandardEffect(
                queued.definition,
                queued.controllerSessionId,
                source,
              );
            }
          },
        };
        return;
      }

      this.resolveStandardEffect(
        queued.definition,
        queued.controllerSessionId,
        source,
      );
    }
  }

  private resolveStandardEffect(
    definition: StandardEffectDefinition,
    controllerSessionId: string,
    source: DuelCard,
  ): void {
    if (!this.canPayCosts(definition.costs ?? [], controllerSessionId)) {
      return;
    }

    const runActions = () => {
      if (definition.trigger.oncePerTurn) {
        this.resolvedOncePerTurnKeys.add(
          this.getOncePerTurnKey(source.instanceId, definition.id),
        );
      }

      this.resolveActions(definition.actions, controllerSessionId, source, {
        storedSelections: {},
      });
    };

    if (!definition.costs || definition.costs.length === 0) {
      runActions();
      return;
    }

    this.resolveActions(
      definition.costs,
      controllerSessionId,
      source,
      { storedSelections: {} },
      0,
      runActions,
    );
  }

  private resolveActions(
    actions: EffectAction[],
    controllerSessionId: string,
    source: DuelCard,
    context: EffectResolutionContext,
    startIndex = 0,
    onComplete?: () => void,
  ): void {
    if (startIndex >= actions.length || this.pendingDecisionState) {
      if (startIndex >= actions.length && !this.pendingDecisionState) {
        onComplete?.();
      }

      return;
    }

    const action = actions[startIndex];
    const next = () =>
      this.resolveActions(
        actions,
        controllerSessionId,
        source,
        context,
        startIndex + 1,
        onComplete,
      );

    switch (action.type) {
      case 'draw': {
        const playerId = this.resolvePlayer(action.player, controllerSessionId);

        if (playerId) {
          for (let index = 0; index < action.amount; index += 1) {
            this.host.drawCard(playerId);
          }

          this.host.syncPlayer(playerId);
        }

        next();
        return;
      }
      case 'ko': {
        this.forSelectedCards(
          action.selector,
          controllerSessionId,
          context,
          `${source.instanceId}:${action.type}:${Math.random()}`,
          'Choisissez la carte a mettre KO.',
          (cards) => {
            for (const target of cards) {
              this.host.koCharacter(
                target.ownerSessionId,
                target.instanceId,
                action.reason ?? 'effect',
              );
            }
            next();
          },
        );
        return;
      }
      case 'koAllCharacters': {
        const targets = this.host
          .getCards(action.selector, controllerSessionId)
          .filter(
            (card) => !action.excludeSource || card.instanceId !== source.instanceId,
          );

        for (const target of targets) {
          this.host.koCharacter(
            target.ownerSessionId,
            target.instanceId,
            action.reason ?? 'effect',
          );
        }

        next();
        return;
      }
      case 'trashFromDeck': {
        const playerId = this.resolvePlayer(action.player, controllerSessionId);

        if (playerId) {
          this.host.trashTopDeckCards(playerId, action.amount);
          this.host.syncPlayer(playerId);
        }

        next();
        return;
      }
      case 'trashFromHand': {
        this.forSelectedCards(
          action.selector,
          controllerSessionId,
          context,
          `${source.instanceId}:${action.type}:${Math.random()}`,
          'Choisissez des cartes a defausser.',
          (cards) => {
            for (const card of cards) {
              this.host.moveCard(card, card.ownerSessionId, 'trash');
            }
            next();
          },
        );
        return;
      }
      case 'rest':
      case 'unrest':
      case 'restand': {
        for (const target of this.host.getCards(action.selector, controllerSessionId)) {
          target.rested = action.type === 'rest';
        }
        next();
        return;
      }
      case 'addToLife': {
        const playerId = this.resolvePlayer(action.player, controllerSessionId);

        if (playerId) {
          for (const card of this.host.getCards(action.selector, controllerSessionId)) {
            this.host.moveCard(card, playerId, 'life', { faceDown: true });
          }
        }

        next();
        return;
      }
      case 'addDon': {
        const playerId = this.resolvePlayer(action.player, controllerSessionId);

        if (playerId) {
          this.host.addDonToCost(playerId, action.amount, action.rested ?? false);
        }

        next();
        return;
      }
      case 'removeDon': {
        const playerId = this.resolvePlayer(action.player, controllerSessionId);

        if (playerId) {
          this.host.returnDonToDonDeck(playerId, action.amount);
        }

        next();
        return;
      }
      case 'reveal': {
        this.host.addLog(
          `${source.name} revele ${action.amount} carte(s) depuis ${action.zone}.`,
        );
        next();
        return;
      }
      case 'search': {
        const playerId = this.resolvePlayer(action.player, controllerSessionId);

        if (!playerId) {
          next();
          return;
        }

        const player = this.host.getPlayer(playerId);

        if (!player) {
          next();
          return;
        }

        const sourceCards =
          action.sourceZone === 'deck' ? player.zones.deck : player.zones.trash;
        const revealed = Array.from(sourceCards).slice(0, action.amount);

        this.chooseCards(
          `${source.instanceId}:${action.type}:${Math.random()}`,
          controllerSessionId,
          { storedSelections: {} },
          controllerSessionId,
          `Choisissez ${action.count.kind === 'upTo' ? "jusqu'a " : ''}${action.count.value} carte(s).`,
          {
            player: 'self',
            zones: [action.sourceZone],
            filter: action.filter,
            count: action.count,
          },
          revealed.map((card) => card.instanceId),
          (cards) => {
            const chosenIds = new Set(cards.map((card) => card.instanceId));

            for (const card of revealed) {
              if (chosenIds.has(card.instanceId)) {
                this.host.moveCard(card, playerId, action.destination);
              } else if (action.restDestination === 'trash') {
                this.host.moveCard(card, playerId, 'trash');
              } else if (action.restDestination === 'deck') {
                this.host.moveCard(card, playerId, 'deck');
              }
            }

            next();
          },
        );
        return;
      }
      case 'moveCard': {
        this.forSelectedCards(
          action.selector,
          controllerSessionId,
          context,
          `${source.instanceId}:${action.type}:${Math.random()}`,
          'Choisissez la carte a deplacer.',
          (cards) => {
            for (const card of cards) {
              const playerId =
                action.destinationPlayer === 'selectedCardOwner'
                  ? card.ownerSessionId
                  : this.resolvePlayer(
                      action.destinationPlayer,
                      controllerSessionId,
                    );

              if (!playerId) {
                continue;
              }

              this.host.moveCard(card, playerId, action.destinationZone, {
                faceDown: action.faceDown,
                rested: action.rested,
              });
            }
            next();
          },
        );
        return;
      }
      case 'moveFirstCard': {
        const card = this.getSelectableCards(
          action.selector,
          controllerSessionId,
          context,
        )[0];

        if (!card) {
          next();
          return;
        }

        const playerId =
          action.destinationPlayer === 'selectedCardOwner'
            ? card.ownerSessionId
            : this.resolvePlayer(action.destinationPlayer, controllerSessionId);

        if (playerId) {
          this.host.moveCard(card, playerId, action.destinationZone, {
            faceDown: action.faceDown,
            rested: action.rested,
          });
        }

        next();
        return;
      }
      case 'modifyPower': {
        this.forSelectedCards(
          action.selector,
          controllerSessionId,
          context,
          `${source.instanceId}:${action.type}:${Math.random()}`,
          'Choisissez la carte dont la puissance sera modifiee.',
          (cards) => {
            for (const target of cards) {
              this.modifiers.push({
                sourceInstanceId: source.instanceId,
                targetInstanceId: target.instanceId,
                amount: action.amount,
                expiresAtEndOfTurn:
                  action.duration.type === 'untilEndOfTurn',
                expiresAtEndOfBattle:
                  action.duration.type === 'untilEndOfBattle',
              });
            }

            this.reapplyContinuousEffects();
            next();
          },
        );
        return;
      }
      case 'grantKeywords': {
        this.forSelectedCards(
          action.selector,
          controllerSessionId,
          context,
          `${source.instanceId}:${action.type}:${Math.random()}`,
          'Choisissez la carte qui gagne un mot-cle.',
          (cards) => {
            for (const target of cards) {
              this.keywordModifiers.push({
                sourceInstanceId: source.instanceId,
                targetInstanceId: target.instanceId,
                keywords: action.keywords,
                expiresAtEndOfTurn:
                  action.duration.type === 'untilEndOfTurn',
                expiresAtEndOfBattle:
                  action.duration.type === 'untilEndOfBattle',
              });
            }

            this.reapplyContinuousEffects();
            next();
          },
        );
        return;
      }
      case 'restrictAttack': {
        for (const target of this.host.getCards(action.selector, controllerSessionId)) {
          target.cannotAttackUntilTurn = Math.max(
            target.cannotAttackUntilTurn,
            this.host.state.turn + action.turns,
          );
        }
        next();
        return;
      }
      case 'activateEffect': {
        const definition = this.registry
          .effectsByCardId[action.cardId]
          ?.standard?.find((candidate) => candidate.id === action.effectId);

        if (definition) {
          this.queueEffect(
            controllerSessionId,
            source.instanceId,
            action.cardId,
            definition,
          );
        }

        next();
        return;
      }
      case 'attachDon': {
        this.forSelectedCards(
          action.selector,
          controllerSessionId,
          context,
          `${source.instanceId}:${action.type}:${Math.random()}`,
          'Choisissez une carte a laquelle attacher des DON!!',
          (cards) => {
            const playerId = this.resolvePlayer(action.player, controllerSessionId);

            if (playerId) {
              for (const card of cards) {
                this.host.attachDon(playerId, card.instanceId, action.amount, {
                  rested: action.rested,
                });
              }
            }

            next();
          },
        );
        return;
      }
      case 'detachDon': {
        for (const target of this.host.getCards(action.selector, controllerSessionId)) {
          target.attachedDon = Math.max(0, target.attachedDon - action.amount);
        }

        next();
        return;
      }
      case 'shuffleDeck': {
        const playerId = this.resolvePlayer(action.player, controllerSessionId);

        if (playerId) {
          this.host.shuffleDeck(playerId);
          this.host.syncPlayer(playerId);
        }

        next();
        return;
      }
      case 'arrangeDeckWindow': {
        const playerId = this.resolvePlayer(action.player, controllerSessionId);
        const player = playerId ? this.host.getPlayer(playerId) : undefined;

        if (!playerId || !player) {
          next();
          return;
        }

        const windowCards = Array.from(player.zones.deck).slice(0, action.amount);

        if (windowCards.length === 0) {
          next();
          return;
        }

        this.arrangeDeckWindow(
          `${source.instanceId}:${action.type}:${Math.random()}`,
          controllerSessionId,
          playerId,
          windowCards,
          () => {
            this.host.syncPlayer(playerId);
            next();
          },
        );
        return;
      }
      case 'revealTopAndPlayIfMatches': {
        const playerId = this.resolvePlayer(action.player, controllerSessionId);
        const player = playerId ? this.host.getPlayer(playerId) : undefined;
        const topCard = player?.zones.deck[0];

        if (!playerId || !player || !topCard) {
          next();
          return;
        }

        this.host.addLog(`${source.name} revele ${topCard.name} depuis le dessus du deck.`);

        if (!this.matchesFilter(topCard, action.filter, controllerSessionId)) {
          next();
          return;
        }

        this.pendingDecisionState = {
          decision: {
            id: `${source.instanceId}:${action.type}:${topCard.instanceId}`,
            effectId: action.type,
            effectCardId: source.cardId,
            sourceInstanceId: source.instanceId,
            playerSessionId: controllerSessionId,
            createdAt: new Date().toISOString(),
            prompt: {
              type: 'confirm',
              message: `Jouer ${topCard.name} revelee depuis le dessus du deck ?`,
              optional: true,
            },
          },
          continuation: (response) => {
            if (response.confirmed) {
              this.host.moveCard(topCard, playerId, action.destination, {
                rested: action.rested ?? false,
              });
            }
            next();
          },
        };
        return;
      }
      case 'storeSelectedCards': {
        this.forSelectedCards(
          action.selector,
          controllerSessionId,
          context,
          `${source.instanceId}:${action.type}:${action.key}:${Math.random()}`,
          'Choisissez la ou les cartes.',
          (cards) => {
            context.storedSelections[action.key] = cards;
            next();
          },
        );
        return;
      }
      case 'revealStoredCards': {
        const cards = context.storedSelections[action.key] ?? [];

        if (cards.length > 0) {
          this.host.addLog(
            `${source.name} revele ${cards.map((card) => card.name).join(', ')}.`,
          );
        }

        next();
        return;
      }
      case 'moveStoredCards': {
        const cards = context.storedSelections[action.key] ?? [];

        for (const card of cards) {
          const playerId =
            action.destinationPlayer === 'selectedCardOwner'
              ? card.ownerSessionId
              : this.resolvePlayer(action.destinationPlayer, controllerSessionId);

          if (!playerId) {
            continue;
          }

          this.host.moveCard(card, playerId, action.destinationZone, {
            faceDown: action.faceDown,
            rested: action.rested,
          });
        }

        next();
        return;
      }
      case 'ifStoredSelectionMatches': {
        const cards = context.storedSelections[action.key] ?? [];
        const matches = cards.some((card) =>
          this.matchesFilter(card, action.filter, controllerSessionId, context),
        );

        if (!matches) {
          next();
          return;
        }

        this.resolveActions(action.actions, controllerSessionId, source, context, 0, next);
        return;
      }
      case 'play': {
        this.forSelectedCards(
          action.selector,
          controllerSessionId,
          context,
          `${source.instanceId}:${action.type}:${Math.random()}`,
          'Choisissez une carte a mettre en jeu.',
          (cards) => {
            for (const card of cards) {
              this.host.moveCard(card, card.ownerSessionId, action.destination, {
                rested: action.rested ?? false,
              });
            }
            next();
          },
        );
      }
    }
  }

  private forSelectedCards(
    selector: EffectTargetSelector,
    controllerSessionId: string,
    context: EffectResolutionContext,
    decisionId: string,
    message: string,
    resolve: (cards: DuelCard[]) => void,
  ): void {
    const targets = this.getSelectableCards(selector, controllerSessionId, context);
    const count = selector.count ?? { kind: 'exact', value: targets.length };
    const min = count.kind === 'exact' ? count.value : 0;
    const max = count.value;

    if (targets.length === 0 && min === 0) {
      resolve([]);
      return;
    }

    if (targets.length <= max && targets.length === min) {
      resolve(targets);
      return;
    }

    this.chooseCards(
      decisionId,
      controllerSessionId,
      context,
      this.resolveSelectorChooser(selector, controllerSessionId),
      message,
      selector,
      undefined,
      resolve,
    );
  }

  private chooseCards(
    decisionId: string,
    controllerSessionId: string,
    context: EffectResolutionContext,
    chooserSessionId: string,
    message: string,
    selector: EffectTargetSelector,
    revealedCards: string[] | undefined,
    resolve: (cards: DuelCard[]) => void,
  ): void {
    const count = selector.count ?? { kind: 'exact', value: 1 };
    const min = count.kind === 'exact' ? count.value : 0;
    const max = count.value;

    this.pendingDecisionState = {
      decision: {
        id: decisionId,
        effectId: decisionId,
        effectCardId: '',
        sourceInstanceId: '',
        playerSessionId: chooserSessionId,
        createdAt: new Date().toISOString(),
        prompt: {
          type: 'selectCards',
          message,
          selector,
          min,
          max,
          revealedCards,
        },
      },
      continuation: (response) => {
        const selected = new Set(response.selectedCardInstanceIds ?? []);
        resolve(
          this.getSelectableCards(selector, controllerSessionId, context)
            .filter((card) => selected.has(card.instanceId)),
        );
      },
    };
  }

  private chooseChoices(
    decisionId: string,
    playerSessionId: string,
    message: string,
    choices: { id: string; label: string; cardInstanceId?: string }[],
    min: number,
    max: number,
    resolve: (choiceIds: string[]) => void,
  ): void {
    this.pendingDecisionState = {
      decision: {
        id: decisionId,
        effectId: decisionId,
        effectCardId: '',
        sourceInstanceId: '',
        playerSessionId,
        createdAt: new Date().toISOString(),
        prompt: {
          type: 'selectChoice',
          message,
          choices,
          min,
          max,
        },
      },
      continuation: (response) => {
        resolve(response.selectedChoiceIds ?? []);
      },
    };
  }

  private arrangeDeckWindow(
    decisionId: string,
    controllerSessionId: string,
    playerSessionId: string,
    windowCards: DuelCard[],
    onComplete: () => void,
  ): void {
    const chooserSessionId =
      this.resolvePlayer('self', controllerSessionId) ?? controllerSessionId;
    const remaining = [...windowCards];
    const topCards: DuelCard[] = [];
    const bottomCards: DuelCard[] = [];

    const pickNextCard = () => {
      if (remaining.length === 0) {
        this.commitDeckWindowOrder(playerSessionId, windowCards, topCards, bottomCards);
        onComplete();
        return;
      }

      this.chooseChoices(
        `${decisionId}:card:${remaining.length}`,
        chooserSessionId,
        'Choisissez la prochaine carte a placer.',
        remaining.map((card) => ({
          id: card.instanceId,
          label: card.name,
          cardInstanceId: card.instanceId,
        })),
        1,
        1,
        (selectedChoiceIds) => {
          const selectedId = selectedChoiceIds[0];
          const selectedIndex = remaining.findIndex(
            (card) => card.instanceId === selectedId,
          );

          if (selectedIndex < 0) {
            pickNextCard();
            return;
          }

          const [selectedCard] = remaining.splice(selectedIndex, 1);

          if (!selectedCard) {
            pickNextCard();
            return;
          }

          this.chooseChoices(
            `${decisionId}:dest:${selectedCard.instanceId}`,
            chooserSessionId,
            `Placez ${selectedCard.name} en haut ou en bas du deck.`,
            [
              { id: 'top', label: 'Haut du deck' },
              { id: 'bottom', label: 'Bas du deck' },
            ],
            1,
            1,
            (destinationChoiceIds) => {
              if (destinationChoiceIds[0] === 'bottom') {
                bottomCards.push(selectedCard);
              } else {
                topCards.push(selectedCard);
              }

              pickNextCard();
            },
          );
        },
      );
    };

    pickNextCard();
  }

  private commitDeckWindowOrder(
    playerSessionId: string,
    windowCards: DuelCard[],
    topCards: DuelCard[],
    bottomCards: DuelCard[],
  ): void {
    const player = this.host.getPlayer(playerSessionId);

    if (!player) {
      return;
    }

    const windowIds = new Set(windowCards.map((card) => card.instanceId));
    const remainingDeck = Array.from(player.zones.deck).filter(
      (card) => !windowIds.has(card.instanceId),
    );
    player.zones.deck.splice(
      0,
      player.zones.deck.length,
      ...topCards,
      ...remainingDeck,
      ...bottomCards,
    );
  }

  private queueTriggeredEffectsForCard(
    event: EffectEvent,
    source: DuelCard,
    controllerSessionId: string,
  ): void {
    const definition = this.registry.effectsByCardId[source.cardId];

    for (const effect of definition?.standard ?? []) {
      if (effect.trigger.type !== event.type) {
        continue;
      }

      if (
        effect.trigger.oncePerTurn &&
        this.resolvedOncePerTurnKeys.has(
          this.getOncePerTurnKey(source.instanceId, effect.id),
        )
      ) {
        continue;
      }

      if (
        !this.conditionsPass(
          effect.conditions ?? [],
          controllerSessionId,
          source,
          event,
        )
      ) {
        continue;
      }

      this.queue.push({
        controllerSessionId,
        sourceInstanceId: source.instanceId,
        sourceCardId: source.cardId,
        definition: effect,
      });
    }
  }

  private conditionsPass(
    conditions: EffectCondition[],
    controllerSessionId: string,
    source: DuelCard,
    event?: EffectEvent,
  ): boolean {
    return conditions.every((condition) => {
      switch (condition.type) {
        case 'controllerTurn':
          return (
            (this.host.state.activePlayerSessionId === controllerSessionId) ===
            condition.value
          );
        case 'sourceHasAttachedDonAtLeast':
          return source.attachedDon >= condition.value;
        case 'playerHasLifeAtMost': {
          const playerId = this.resolvePlayer(condition.player, controllerSessionId);
          const player = playerId ? this.host.getPlayer(playerId) : undefined;
          return (player?.zones.life.length ?? 0) <= condition.value;
        }
        case 'playerHasLeaderName': {
          const playerId = this.resolvePlayer(condition.player, controllerSessionId);
          const player = playerId ? this.host.getPlayer(playerId) : undefined;
          return player?.zones.leader.name === condition.value;
        }
        case 'playerHasLeaderTrait': {
          const playerId = this.resolvePlayer(condition.player, controllerSessionId);
          const player = playerId ? this.host.getPlayer(playerId) : undefined;
          return player?.zones.leader.families.includes(condition.value) ?? false;
        }
        case 'playerHasTotalDonAtLeast': {
          const playerId = this.resolvePlayer(condition.player, controllerSessionId);
          return (
            this.countTotalDonOnField(playerId) >= condition.value
          );
        }
        case 'eventPlayerIs': {
          if (!event) {
            return false;
          }

          const playerId = this.resolvePlayer(condition.player, controllerSessionId);
          return playerId === event.playerSessionId;
        }
        case 'targetExists':
          return this.host.getCards(condition.selector, controllerSessionId).length > 0;
        case 'targetCountAtLeast':
          return (
            this.host.getCards(condition.selector, controllerSessionId).length >=
            condition.value
          );
        case 'targetCountAtMost':
          return (
            this.host.getCards(condition.selector, controllerSessionId).length <=
            condition.value
          );
        case 'cardInZone':
          return this.findZoneOfCard(source)?.zone === condition.zone;
        case 'sourceIsRested':
          return source.rested === condition.value;
      }
    });
  }

  private resolvePlayer(
    selector: EffectOwnerSelector,
    controllerSessionId: string,
  ): string | null {
    if (selector === 'self') {
      return controllerSessionId;
    }

    if (selector === 'opponent') {
      return this.host.getOpponentSessionId(controllerSessionId);
    }

    return controllerSessionId;
  }

  private resolveSelectorChooser(
    selector: EffectTargetSelector,
    controllerSessionId: string,
  ): string {
    return (
      this.resolvePlayer(selector.chooser ?? 'self', controllerSessionId) ??
      controllerSessionId
    );
  }

  private applyKeywords(card: DuelCard, keywords: EffectKeyword[]): void {
    for (const keyword of keywords) {
      switch (keyword) {
        case 'rush':
          card.hasRush = true;
          break;
        case 'doubleAttack':
          card.hasDoubleAttack = true;
          break;
        case 'banish':
          card.hasBanish = true;
          break;
        case 'canAttackActiveCharacters':
          card.canAttackActiveCharacters = true;
          break;
        case 'mustBeAttackTarget':
          card.mustBeAttackTarget = true;
          break;
        case 'cannotBlock':
          card.cannotBlock = true;
          break;
        case 'cannotBeKoedInBattle':
          card.cannotBeKoedInBattle = true;
          break;
        case 'cannotBeKoedByStrikeInBattle':
          card.cannotBeKoedByStrikeInBattle = true;
          break;
      }
    }
  }

  private matchesFilter(
    card: DuelCard,
    filter: EffectCardFilter | undefined,
    controllerSessionId: string,
    context?: EffectResolutionContext,
  ): boolean {
    if (!filter) {
      return true;
    }

    if (filter.cardCategory && !filter.cardCategory.includes(card.type)) {
      return false;
    }

    if (typeof filter.costMax === 'number' && card.cost > filter.costMax) {
      return false;
    }

    if (typeof filter.costMin === 'number' && card.cost < filter.costMin) {
      return false;
    }

    if (typeof filter.powerMax === 'number' && card.power > filter.powerMax) {
      return false;
    }

    if (typeof filter.powerMin === 'number' && card.power < filter.powerMin) {
      return false;
    }

    if (filter.color && !filter.color.some((color) => card.colors.includes(color))) {
      return false;
    }

    if (filter.differentColorThanStoredSelection) {
      const storedCard =
        context?.storedSelections[filter.differentColorThanStoredSelection]?.[0];

      if (
        storedCard &&
        card.colors.some((color) => storedCard.colors.includes(color))
      ) {
        return false;
      }
    }

    if (filter.trait && !filter.trait.some((trait) => card.families.includes(trait))) {
      return false;
    }

    if (filter.name && !filter.name.includes(card.name)) {
      return false;
    }

    if (filter.excludeName && filter.excludeName.includes(card.name)) {
      return false;
    }

    if (typeof filter.rested === 'boolean' && card.rested !== filter.rested) {
      return false;
    }

    if (filter.owner === 'self' && card.ownerSessionId !== controllerSessionId) {
      return false;
    }

    if (filter.owner === 'opponent' && card.ownerSessionId === controllerSessionId) {
      return false;
    }

    return true;
  }

  private getSelectableCards(
    selector: EffectTargetSelector,
    controllerSessionId: string,
    context: EffectResolutionContext,
  ): DuelCard[] {
    return this.host
      .getCards(selector, controllerSessionId)
      .filter((card) =>
        this.matchesFilter(card, selector.filter, controllerSessionId, context),
      );
  }

  private collectInPlayCards(): DuelCard[] {
    const cards: DuelCard[] = [];

    for (const player of this.host.state.players.values()) {
      cards.push(player.zones.leader, ...player.zones.characters);

      if (player.zones.stage.instanceId) {
        cards.push(player.zones.stage);
      }
    }

    return cards;
  }

  private collectPlayerCards(player: DuelPlayer): DuelCard[] {
    return [
      player.zones.leader,
      ...(player.zones.stage.instanceId ? [player.zones.stage] : []),
      ...player.zones.deck,
      ...player.zones.donDeck,
      ...player.zones.hand,
      ...player.zones.life,
      ...player.zones.characters,
      ...player.zones.cost,
      ...player.zones.trash,
    ];
  }

  private getOncePerTurnKey(sourceInstanceId: string, effectId: string): string {
    return `${sourceInstanceId}:${effectId}:${this.host.state.turn}`;
  }

  private canPayCosts(
    costs: EffectAction[],
    controllerSessionId: string,
  ): boolean {
    return costs.every((cost) =>
      this.canResolveCostAction(cost, controllerSessionId),
    );
  }

  private canResolveCostAction(
    action: EffectAction,
    controllerSessionId: string,
  ): boolean {
    switch (action.type) {
      case 'removeDon': {
        const playerId = this.resolvePlayer(action.player, controllerSessionId);
        const player = playerId ? this.host.getPlayer(playerId) : undefined;
        return (player?.zones.cost.length ?? 0) >= action.amount;
      }
      case 'trashFromHand':
      case 'rest':
      case 'unrest':
      case 'restand':
      case 'moveCard':
      case 'moveFirstCard':
      case 'attachDon':
      case 'play':
      case 'ko':
      case 'koAllCharacters':
      case 'modifyPower':
      case 'grantKeywords':
      case 'restrictAttack':
      case 'addToLife':
      case 'detachDon':
        return this.hasSelectableCards(action.selector, controllerSessionId);
      case 'draw':
      case 'trashFromDeck':
      case 'addDon':
      case 'reveal':
      case 'search':
      case 'shuffleDeck':
      case 'arrangeDeckWindow':
      case 'revealTopAndPlayIfMatches':
      case 'revealStoredCards':
      case 'moveStoredCards':
      case 'ifStoredSelectionMatches':
      case 'activateEffect':
        return true;
      case 'storeSelectedCards':
        return this.hasSelectableCards(action.selector, controllerSessionId);
    }
  }

  private hasSelectableCards(
    selector: EffectTargetSelector,
    controllerSessionId: string,
  ): boolean {
    const available = this.host.getCards(selector, controllerSessionId).length;
    const count = selector.count ?? { kind: 'exact' as const, value: available };

    if (count.kind === 'upTo') {
      return available > 0 || count.value === 0;
    }

    return available >= count.value;
  }

  private countTotalDonOnField(playerSessionId: string | null): number {
    if (!playerSessionId) {
      return 0;
    }

    const player = this.host.getPlayer(playerSessionId);

    if (!player) {
      return 0;
    }

    const inPlayCards = [
      player.zones.leader,
      ...player.zones.characters,
      ...(player.zones.stage.instanceId ? [player.zones.stage] : []),
    ];

    return (
      player.zones.cost.length +
      inPlayCards.reduce((sum, card) => sum + card.attachedDon, 0)
    );
  }

  private findZoneOfCard(card: DuelCard):
    | {
        player: DuelPlayer;
        zone: string;
      }
    | null {
    for (const player of this.host.state.players.values()) {
      if (player.zones.leader.instanceId === card.instanceId) {
        return { player, zone: 'leader' };
      }

      if (player.zones.stage.instanceId === card.instanceId) {
        return { player, zone: 'stage' };
      }

      for (const zone of ['deck', 'donDeck', 'hand', 'life', 'characters', 'cost', 'trash'] as const) {
        if (player.zones[zone].some((candidate) => candidate.instanceId === card.instanceId)) {
          return { player, zone };
        }
      }
    }

    return null;
  }
}
