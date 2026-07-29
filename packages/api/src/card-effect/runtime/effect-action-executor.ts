import type { EffectAction, EffectTargetSelector } from '@onepiecetcg/shared';
import type { DuelCard } from '@onepiecetcg/shared';
import type { EffectRegistry } from '../types/effect-registry';
import { EffectDecisionManager } from './effect-decision-manager';
import { EffectModifierEngine } from './effect-modifier-engine';
import { EffectSelectorResolver } from './effect-selector-resolver';
import type {
  EffectEngineHost,
  EffectResolutionContext,
} from './effect-engine-types';

type QueueEffectFn = (
  controllerSessionId: string,
  sourceInstanceId: string,
  sourceCardId: string,
  effectId: string,
) => void;

/**
 * Interprets authored `EffectAction[]` against the authoritative duel state.
 */
export class EffectActionExecutor {
  public constructor(
    private readonly registry: EffectRegistry,
    private readonly host: EffectEngineHost,
    private readonly selectors: EffectSelectorResolver,
    private readonly decisions: EffectDecisionManager,
    private readonly modifiers: EffectModifierEngine,
    private readonly queueEffect: QueueEffectFn,
  ) {}

  /** Resolves an authored action list sequentially, pausing for decisions when needed. */
  public resolveActions(
    actions: EffectAction[],
    controllerSessionId: string,
    source: DuelCard,
    context: EffectResolutionContext,
    startIndex = 0,
    onComplete?: () => void,
  ): void {
    if (startIndex >= actions.length || this.decisions.hasPendingDecision()) {
      if (
        startIndex >= actions.length &&
        !this.decisions.hasPendingDecision()
      ) {
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
        const playerId = this.selectors.resolvePlayer(
          action.player,
          controllerSessionId,
        );

        if (playerId) {
          for (let index = 0; index < action.amount; index += 1) {
            this.host.drawCard(playerId);
          }

          this.host.syncPlayer(playerId);
        }

        next();
        return;
      }
      case 'drawUntilHandSize': {
        const playerId = this.selectors.resolvePlayer(
          action.player,
          controllerSessionId,
        );
        const player = playerId ? this.host.getPlayer(playerId) : undefined;

        if (playerId && player) {
          const missing = Math.max(0, action.size - player.zones.hand.length);

          for (let index = 0; index < missing; index += 1) {
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
          this.createDecisionId(source.instanceId, action.type),
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
            (card) =>
              !action.excludeSource || card.instanceId !== source.instanceId,
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
        const playerId = this.selectors.resolvePlayer(
          action.player,
          controllerSessionId,
        );

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
          this.createDecisionId(source.instanceId, action.type),
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
        for (const target of this.host.getCards(
          action.selector,
          controllerSessionId,
        )) {
          target.rested = action.type === 'rest';
        }
        next();
        return;
      }
      case 'addToLife': {
        const playerId = this.selectors.resolvePlayer(
          action.player,
          controllerSessionId,
        );

        if (playerId) {
          for (const card of this.host.getCards(
            action.selector,
            controllerSessionId,
          )) {
            this.host.moveCard(card, playerId, 'life', { faceDown: true });
          }
        }

        next();
        return;
      }
      case 'addDon': {
        const playerId = this.selectors.resolvePlayer(
          action.player,
          controllerSessionId,
        );

        if (playerId) {
          this.host.addDonToCost(
            playerId,
            action.amount,
            action.rested ?? false,
          );
        }

        next();
        return;
      }
      case 'removeDon': {
        const playerId = this.selectors.resolvePlayer(
          action.player,
          controllerSessionId,
        );

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
        const playerId = this.selectors.resolvePlayer(
          action.player,
          controllerSessionId,
        );

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

        this.decisions.chooseCards(
          this.createDecisionId(source.instanceId, action.type),
          controllerSessionId,
          context,
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
          this.createDecisionId(source.instanceId, action.type),
          'Choisissez la carte a deplacer.',
          (cards) => {
            this.moveCardsWithOptionalDestinationChoice(
              cards,
              controllerSessionId,
              source,
              action.destinationPlayer,
              action.destinationZone,
              {
                faceDown: action.faceDown,
                rested: action.rested,
                toBottom: action.toBottom,
                chooseDestinationPosition: action.chooseDestinationPosition,
              },
              next,
            );
          },
        );
        return;
      }
      case 'moveFirstCard': {
        const card = this.selectors.getSelectableCards(
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
            : this.selectors.resolvePlayer(
                action.destinationPlayer,
                controllerSessionId,
              );

        if (playerId) {
          if (
            !this.canMoveCardByEffect(
              card,
              controllerSessionId,
              action.destinationZone,
            )
          ) {
            next();
            return;
          }

          this.host.moveCard(card, playerId, action.destinationZone, {
            faceDown: action.faceDown,
            rested: action.rested,
            toBottom: action.toBottom,
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
          this.createDecisionId(source.instanceId, action.type),
          'Choisissez la carte dont la puissance sera modifiee.',
          (cards) => {
            for (const target of cards) {
              this.modifiers.addPowerModifier(
                source.instanceId,
                controllerSessionId,
                target.instanceId,
                action.amount,
                action.duration.type,
              );
            }

            this.modifiers.reapplyContinuousEffects();
            next();
          },
        );
        return;
      }
      case 'modifyPowerByStoredCount': {
        const cards = context.storedSelections[action.key] ?? [];
        const amount = cards.length * action.amountPerCard;

        if (amount === 0) {
          next();
          return;
        }

        this.forSelectedCards(
          action.selector,
          controllerSessionId,
          context,
          this.createDecisionId(source.instanceId, action.type),
          'Choisissez la carte dont la puissance sera modifiee.',
          (targets) => {
            for (const target of targets) {
              this.modifiers.addPowerModifier(
                source.instanceId,
                controllerSessionId,
                target.instanceId,
                amount,
                action.duration.type,
              );
            }

            this.modifiers.reapplyContinuousEffects();
            next();
          },
        );
        return;
      }
      case 'modifyCost': {
        this.forSelectedCards(
          action.selector,
          controllerSessionId,
          context,
          this.createDecisionId(source.instanceId, action.type),
          'Choisissez la carte dont le cout sera modifie.',
          (cards) => {
            for (const target of cards) {
              this.modifiers.addCostModifier(
                source.instanceId,
                controllerSessionId,
                target.instanceId,
                action.amount,
                action.duration.type,
              );
            }

            this.modifiers.reapplyContinuousEffects();
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
          this.createDecisionId(source.instanceId, action.type),
          'Choisissez la carte qui gagne un mot-cle.',
          (cards) => {
            for (const target of cards) {
              this.modifiers.addKeywordModifier(
                source.instanceId,
                controllerSessionId,
                target.instanceId,
                action.keywords,
                action.duration.type,
              );
            }

            this.modifiers.reapplyContinuousEffects();
            next();
          },
        );
        return;
      }
      case 'preventOwnEffectLifeToHand': {
        const playerId = this.selectors.resolvePlayer(
          action.player,
          controllerSessionId,
        );

        if (playerId) {
          this.modifiers.addPlayerRestriction(
            playerId,
            'preventOwnEffectLifeToHand',
            action.duration.type,
          );
        }

        next();
        return;
      }
      case 'restrictAttack': {
        for (const target of this.host.getCards(
          action.selector,
          controllerSessionId,
        )) {
          target.cannotAttackUntilTurn = Math.max(
            target.cannotAttackUntilTurn,
            this.host.state.turn + action.turns,
          );
        }
        next();
        return;
      }
      case 'activateEffect': {
        this.queueEffect(
          controllerSessionId,
          source.instanceId,
          action.cardId,
          action.effectId,
        );

        next();
        return;
      }
      case 'attachDon': {
        this.forSelectedCards(
          action.selector,
          controllerSessionId,
          context,
          this.createDecisionId(source.instanceId, action.type),
          'Choisissez une carte a laquelle attacher des DON!!',
          (cards) => {
            const playerId = this.selectors.resolvePlayer(
              action.player,
              controllerSessionId,
            );

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
        for (const target of this.host.getCards(
          action.selector,
          controllerSessionId,
        )) {
          target.attachedDon = Math.max(0, target.attachedDon - action.amount);
        }

        next();
        return;
      }
      case 'registerNextPlayCostModifier': {
        const playerId = this.selectors.resolvePlayer(
          action.player,
          controllerSessionId,
        );

        if (playerId) {
          this.modifiers.registerNextPlayCostModifier(
            playerId,
            source.instanceId,
            action.filter,
            action.sourceZone,
            action.amount,
          );
        }

        next();
        return;
      }
      case 'scheduleMoveAtEndOfBattle': {
        this.forSelectedCards(
          action.selector,
          controllerSessionId,
          context,
          this.createDecisionId(source.instanceId, action.type),
          'Choisissez la carte a deplacer a la fin du combat.',
          (cards) => {
            for (const card of cards) {
              const playerId =
                action.destinationPlayer === 'selectedCardOwner'
                  ? card.ownerSessionId
                  : this.selectors.resolvePlayer(
                      action.destinationPlayer,
                      controllerSessionId,
                    );

              if (!playerId) {
                continue;
              }

              this.modifiers.scheduleMoveAtEndOfBattle(
                card.instanceId,
                playerId,
                action.destinationZone,
                {
                  faceDown: action.faceDown,
                  rested: action.rested,
                  toBottom: action.toBottom,
                },
              );
            }

            next();
          },
        );
        return;
      }
      case 'skipNextRefreshPhases': {
        this.forSelectedCards(
          action.selector,
          controllerSessionId,
          context,
          this.createDecisionId(source.instanceId, action.type),
          'Choisissez la carte qui ne deviendra pas active lors de sa prochaine phase de Recharge.',
          (cards) => {
            for (const card of cards) {
              card.skipNextRefreshPhases = Math.max(
                card.skipNextRefreshPhases,
                action.amount,
              );
            }

            next();
          },
        );
        return;
      }
      case 'shuffleDeck': {
        const playerId = this.selectors.resolvePlayer(
          action.player,
          controllerSessionId,
        );

        if (playerId) {
          this.host.shuffleDeck(playerId);
          this.host.syncPlayer(playerId);
        }

        next();
        return;
      }
      case 'arrangeDeckWindow': {
        const playerId = this.selectors.resolvePlayer(
          action.player,
          controllerSessionId,
        );
        const player = playerId ? this.host.getPlayer(playerId) : undefined;

        if (!playerId || !player) {
          next();
          return;
        }

        const windowCards = Array.from(player.zones.deck).slice(
          0,
          action.amount,
        );

        if (windowCards.length === 0) {
          next();
          return;
        }

        this.arrangeDeckWindow(
          this.createDecisionId(source.instanceId, action.type),
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
        const playerId = this.selectors.resolvePlayer(
          action.player,
          controllerSessionId,
        );
        const player = playerId ? this.host.getPlayer(playerId) : undefined;
        const topCard = player?.zones.deck[0];

        if (!playerId || !player || !topCard) {
          next();
          return;
        }

        this.host.addLog(
          `${source.name} revele ${topCard.name} depuis le dessus du deck.`,
        );

        if (
          !this.selectors.matchesFilter(
            topCard,
            action.filter,
            controllerSessionId,
          )
        ) {
          next();
          return;
        }

        this.decisions.pause(
          {
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
          (response) => {
            if (response.confirmed) {
              this.host.moveCard(topCard, playerId, action.destination, {
                rested: action.rested ?? false,
              });
            }
            next();
          },
        );
        return;
      }
      case 'storeSelectedCards': {
        this.forSelectedCards(
          action.selector,
          controllerSessionId,
          context,
          this.createDecisionId(
            source.instanceId,
            `${action.type}:${action.key}`,
          ),
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
        this.moveCardsWithOptionalDestinationChoice(
          cards,
          controllerSessionId,
          source,
          action.destinationPlayer,
          action.destinationZone,
          {
            faceDown: action.faceDown,
            rested: action.rested,
            toBottom: action.toBottom,
            chooseDestinationPosition: action.chooseDestinationPosition,
          },
          next,
        );
        return;
      }
      case 'ifStoredSelectionMatches': {
        const cards = context.storedSelections[action.key] ?? [];
        const matches = cards.some((card) =>
          this.selectors.matchesFilter(
            card,
            action.filter,
            controllerSessionId,
            context,
          ),
        );

        if (!matches) {
          next();
          return;
        }

        this.resolveActions(
          action.actions,
          controllerSessionId,
          source,
          context,
          0,
          next,
        );
        return;
      }
      case 'play': {
        this.forSelectedCards(
          action.selector,
          controllerSessionId,
          context,
          this.createDecisionId(source.instanceId, action.type),
          'Choisissez une carte a mettre en jeu.',
          (cards) => {
            for (const card of cards) {
              this.host.moveCard(
                card,
                card.ownerSessionId,
                action.destination,
                {
                  rested: action.rested ?? false,
                },
              );
            }
            next();
          },
        );
        return;
      }
      case 'chooseActionBranch': {
        if (action.choices.length === 0) {
          next();
          return;
        }

        this.decisions.chooseChoices(
          this.createDecisionId(source.instanceId, action.type),
          controllerSessionId,
          action.message,
          action.choices.map((choice) => ({
            id: choice.id,
            label: choice.label,
          })),
          1,
          1,
          (choiceIds) => {
            const selected = action.choices.find(
              (choice) => choice.id === choiceIds[0],
            );

            if (!selected) {
              next();
              return;
            }

            this.resolveActions(
              selected.actions,
              controllerSessionId,
              source,
              context,
              0,
              next,
            );
          },
        );
        return;
      }
    }
  }

  /** Returns true when every authored cost can currently be paid. */
  public canPayCosts(
    costs: EffectAction[],
    controllerSessionId: string,
  ): boolean {
    return costs.every((cost) =>
      this.canResolveCostAction(cost, controllerSessionId),
    );
  }

  private forSelectedCards(
    selector: EffectTargetSelector,
    controllerSessionId: string,
    context: EffectResolutionContext,
    decisionId: string,
    message: string,
    resolve: (cards: DuelCard[]) => void,
  ): void {
    const targets = this.selectors.getSelectableCards(
      selector,
      controllerSessionId,
      context,
    );
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

    this.decisions.chooseCards(
      decisionId,
      controllerSessionId,
      context,
      this.selectors.resolveSelectorChooser(selector, controllerSessionId),
      message,
      selector,
      undefined,
      resolve,
    );
  }

  private arrangeDeckWindow(
    decisionId: string,
    controllerSessionId: string,
    playerSessionId: string,
    windowCards: DuelCard[],
    onComplete: () => void,
  ): void {
    const chooserSessionId =
      this.selectors.resolvePlayer('self', controllerSessionId) ??
      controllerSessionId;
    const remaining = [...windowCards];
    const topCards: DuelCard[] = [];
    const bottomCards: DuelCard[] = [];

    const pickNextCard = () => {
      if (remaining.length === 0) {
        this.commitDeckWindowOrder(
          playerSessionId,
          windowCards,
          topCards,
          bottomCards,
        );
        onComplete();
        return;
      }

      this.decisions.chooseChoices(
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

          this.decisions.chooseChoices(
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

  private canResolveCostAction(
    action: EffectAction,
    controllerSessionId: string,
  ): boolean {
    switch (action.type) {
      case 'removeDon': {
        const playerId = this.selectors.resolvePlayer(
          action.player,
          controllerSessionId,
        );
        const player = playerId ? this.host.getPlayer(playerId) : undefined;
        return (player?.zones.cost.length ?? 0) >= action.amount;
      }
      case 'trashFromHand':
      case 'rest':
      case 'unrest':
      case 'restand':
      case 'moveCard':
      case 'moveFirstCard':
      case 'scheduleMoveAtEndOfBattle':
      case 'skipNextRefreshPhases':
      case 'attachDon':
      case 'play':
      case 'ko':
      case 'koAllCharacters':
      case 'modifyPower':
      case 'modifyCost':
      case 'grantKeywords':
      case 'modifyPowerByStoredCount':
      case 'restrictAttack':
      case 'addToLife':
      case 'detachDon':
        return this.selectors.hasSelectableCards(
          action.selector,
          controllerSessionId,
        );
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
      case 'drawUntilHandSize':
      case 'preventOwnEffectLifeToHand':
      case 'registerNextPlayCostModifier':
        return true;
      case 'chooseActionBranch':
        return true;
      case 'storeSelectedCards':
        return this.selectors.hasSelectableCards(
          action.selector,
          controllerSessionId,
        );
    }
  }

  private createDecisionId(sourceInstanceId: string, suffix: string): string {
    return `${sourceInstanceId}:${suffix}:${Math.random()}`;
  }

  private moveCardsWithOptionalDestinationChoice(
    cards: DuelCard[],
    controllerSessionId: string,
    source: DuelCard,
    destinationPlayer:
      | import('@onepiecetcg/shared').EffectOwnerSelector
      | 'selectedCardOwner',
    destinationZone: string,
    options: {
      faceDown?: boolean;
      rested?: boolean;
      toBottom?: boolean;
      chooseDestinationPosition?: boolean;
    },
    onComplete: () => void,
    index = 0,
  ): void {
    if (index >= cards.length) {
      onComplete();
      return;
    }

    const card = cards[index];

    if (
      !this.canMoveCardByEffect(card, controllerSessionId, destinationZone)
    ) {
      this.moveCardsWithOptionalDestinationChoice(
        cards,
        controllerSessionId,
        source,
        destinationPlayer,
        destinationZone,
        options,
        onComplete,
        index + 1,
      );
      return;
    }

    const playerId =
      destinationPlayer === 'selectedCardOwner'
        ? card.ownerSessionId
        : this.selectors.resolvePlayer(destinationPlayer, controllerSessionId);

    if (!playerId) {
      this.moveCardsWithOptionalDestinationChoice(
        cards,
        controllerSessionId,
        source,
        destinationPlayer,
        destinationZone,
        options,
        onComplete,
        index + 1,
      );
      return;
    }

    const finishMove = (toBottom: boolean | undefined) => {
      this.host.moveCard(card, playerId, destinationZone, {
        faceDown: options.faceDown,
        rested: options.rested,
        toBottom,
      });
      this.moveCardsWithOptionalDestinationChoice(
        cards,
        controllerSessionId,
        source,
        destinationPlayer,
        destinationZone,
        options,
        onComplete,
        index + 1,
      );
    };

    if (!options.chooseDestinationPosition) {
      finishMove(options.toBottom);
      return;
    }

    this.decisions.chooseChoices(
      `${source.instanceId}:move-pos:${card.instanceId}:${index}`,
      controllerSessionId,
      `Placez ${card.name} en haut ou en bas de ${destinationZone}.`,
      [
        { id: 'top', label: 'Haut' },
        { id: 'bottom', label: 'Bas' },
      ],
      1,
      1,
      (choiceIds) => {
        finishMove(choiceIds[0] === 'bottom');
      },
    );
  }

  private canMoveCardByEffect(
    card: DuelCard,
    controllerSessionId: string,
    destinationZone: string,
  ): boolean {
    const currentZone = this.selectors.findZoneOfCard(card)?.zone;
    const staysInField =
      destinationZone === 'characters' || destinationZone === 'stage';

    if (
      currentZone === 'life' &&
      destinationZone === 'hand' &&
      card.ownerSessionId === controllerSessionId &&
      this.modifiers.blocksOwnEffectLifeToHand(card.ownerSessionId)
    ) {
      return false;
    }

    if (
      !card.cannotBeRemovedByOpponentEffects ||
      card.ownerSessionId === controllerSessionId
    ) {
      return true;
    }

    if (
      (currentZone === 'characters' || currentZone === 'stage') &&
      !staysInField
    ) {
      return false;
    }

    return true;
  }
}
