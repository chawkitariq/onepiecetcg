import type {
  EffectDecisionResponse,
  StandardEffectDefinition,
} from '@onepiecetcg/shared';
import type { DuelCard } from '@onepiecetcg/shared';
import { EffectActionExecutor } from './runtime/effect-action-executor';
import { EffectConditionEvaluator } from './runtime/effect-condition-evaluator';
import { EffectDecisionManager } from './runtime/effect-decision-manager';
import { EffectModifierEngine } from './runtime/effect-modifier-engine';
import { EffectSelectorResolver } from './runtime/effect-selector-resolver';
import type {
  EffectEngineCardStatPatch,
  EffectEngineCardStatusPatch,
  EffectEngineState,
  EffectEngineHost,
  EffectEvent,
  EffectEventType,
  QueuedEffect,
  ReplacementQuery,
} from './runtime/effect-engine-types';
import type { EffectRegistry } from './types/effect-registry';

export type {
  EffectEngineCardStatPatch,
  EffectEngineCardStatusPatch,
  EffectEngineHost,
  EffectEvent,
  EffectEventType,
  ReplacementQuery,
} from './runtime/effect-engine-types';

export type SpecialEffectHandlerEngine = Pick<
  EffectEngine,
  | 'state'
  | 'getPlayer'
  | 'getOpponentSessionId'
  | 'getCard'
  | 'getCards'
  | 'addLog'
  | 'patchCardStatus'
  | 'patchCardStats'
  | 'patchPlayerStatus'
  | 'playCard'
  | 'moveCard'
  | 'setZoneOrder'
  | 'addDonToCost'
  | 'returnDonToDonDeck'
  | 'koCharacter'
  | 'syncPlayer'
  | 'chooseCards'
  | 'chooseChoices'
  | 'pauseDecision'
  | 'addPowerModifier'
  | 'addKeywordModifier'
  | 'addCostModifier'
  | 'addPlayerRestriction'
  | 'registerNextPlayCostModifier'
  | 'hasResolvedOncePerTurnKey'
  | 'markResolvedOncePerTurnKey'
  | 'arrangeDeckWindow'
  | 'queueEffect'
  | 'scheduleTurnEndActions'
  | 'reapplyContinuousEffects'
>;

/**
 * Pure server-side automatic effect resolver for the authoritative duel room.
 */
export class EffectEngine {
  private readonly queue: QueuedEffect[] = [];

  private readonly delayedTurnEndQueue: QueuedEffect[] = [];

  private readonly resolvedOncePerTurnKeys = new Set<string>();

  private readonly selectors: EffectSelectorResolver;

  private readonly conditions: EffectConditionEvaluator;

  private readonly decisions: EffectDecisionManager;

  private readonly modifiers: EffectModifierEngine;

  private readonly actions: EffectActionExecutor;

  public _cannotRestKeys?: Set<string>;

  public constructor(
    private readonly registry: EffectRegistry,
    private readonly host: EffectEngineHost,
  ) {
    this.selectors = new EffectSelectorResolver(host);
    this.conditions = new EffectConditionEvaluator(host, this.selectors);
    this.decisions = new EffectDecisionManager(host, this.selectors);
    this.modifiers = new EffectModifierEngine(
      registry,
      host,
      this.selectors,
      this.conditions,
    );
    this.actions = new EffectActionExecutor(
      registry,
      host,
      this.selectors,
      this.conditions,
      this.decisions,
      this.modifiers,
      (
        controllerSessionId: string,
        sourceInstanceId: string,
        sourceCardId: string,
        effectId: string,
      ) => {
        const definition = this.registry.effectsByCardId[
          sourceCardId
        ]?.standard?.find((candidate) => candidate.id === effectId);

        if (definition) {
          this.queueEffect(
            controllerSessionId,
            sourceInstanceId,
            sourceCardId,
            definition,
          );
        }
      },
      (controllerSessionId, source, actions) => {
        this.scheduleTurnEndActions(controllerSessionId, source, actions);
      },
      (event) => {
        this.handleEvent(event);
      },
    );
  }

  /** Serializes the pending player choice, if the resolver is paused on one. */
  public getPendingDecision() {
    return this.decisions.getPendingDecision();
  }

  /** Exposes the authoritative gameplay state to special handlers. */
  public get state() {
    return this.host.state;
  }

  /** Returns one player from the authoritative gameplay state. */
  public getPlayer(sessionId: string) {
    return this.host.getPlayer(sessionId);
  }

  /** Returns the opposing player's session id when available. */
  public getOpponentSessionId(sessionId: string) {
    return this.host.getOpponentSessionId(sessionId);
  }

  /** Resolves one card instance from the authoritative gameplay state. */
  public getCard(instanceId: string) {
    return this.host.getCard(instanceId);
  }

  /** Resolves cards through the gameplay query port. */
  public getCards(
    selector: Parameters<EffectEngineHost['getCards']>[0],
    controllerSessionId: string,
  ) {
    return this.host.getCards(selector, controllerSessionId);
  }

  /** Adds one gameplay/effect log line through the gameplay command port. */
  public addLog(message: string): void {
    this.host.addLog(message);
  }

  /** Applies one gameplay card-status patch through the gameplay command port. */
  public patchCardStatus(
    instanceId: string,
    patch: EffectEngineCardStatusPatch,
  ) {
    return this.host.patchCardStatus?.(instanceId, patch);
  }

  /** Applies one gameplay card-stat patch through the gameplay command port. */
  public patchCardStats(
    instanceId: string,
    patch: EffectEngineCardStatPatch,
  ) {
    return this.host.patchCardStats?.(instanceId, patch);
  }

  /** Applies one gameplay player-status patch through the gameplay command port. */
  public patchPlayerStatus(
    playerSessionId: string,
    patch: { cannotPlayCharacters?: boolean },
  ) {
    return this.host.patchPlayerStatus?.(playerSessionId, patch);
  }

  /** Moves one card through the gameplay command port. */
  public playCard(
    card: DuelCard,
    playerSessionId: string,
    zone: 'characters' | 'stage',
    options?: { rested?: boolean },
  ) {
    return this.host.playCard?.(card, playerSessionId, zone, options) ?? false;
  }

  /** Moves one card through the gameplay command port. */
  public moveCard(
    card: Parameters<EffectEngineHost['moveCard']>[0],
    destinationPlayerSessionId: string,
    destinationZone: string,
    options?: Parameters<EffectEngineHost['moveCard']>[3],
  ): void {
    this.host.moveCard(
      card,
      destinationPlayerSessionId,
      destinationZone,
      options,
    );
  }

  /** Reorders one ordered gameplay zone through the gameplay command port. */
  public setZoneOrder(
    playerSessionId: string,
    zone: Parameters<NonNullable<EffectEngineHost['setZoneOrder']>>[1],
    orderedInstanceIds: string[],
    options?: Parameters<NonNullable<EffectEngineHost['setZoneOrder']>>[3],
  ): boolean {
    return (
      this.host.setZoneOrder?.(
        playerSessionId,
        zone,
        orderedInstanceIds,
        options,
      ) ?? false
    );
  }

  /** Adds DON!! cards from the DON!! deck to cost through the gameplay port. */
  public addDonToCost(
    playerSessionId: string,
    amount: number,
    rested: boolean,
  ) {
    return this.host.addDonToCost(playerSessionId, amount, rested);
  }

  /** Returns DON!! cards from field/cost back to the DON!! deck. */
  public returnDonToDonDeck(playerSessionId: string, amount: number) {
    return this.host.returnDonToDonDeck(playerSessionId, amount);
  }

  /** K.O.s a character through the gameplay port. */
  public koCharacter(
    playerSessionId: string,
    instanceId: string,
    reason: 'battle' | 'effect',
  ) {
    return this.host.koCharacter(playerSessionId, instanceId, reason);
  }

  /** Syncs one player after a gameplay command mutated their public state. */
  public syncPlayer(playerSessionId: string): void {
    this.host.syncPlayer(playerSessionId);
  }

  /** Opens a card-selection prompt for a special handler. */
  public chooseCards(
    ...args: Parameters<EffectDecisionManager['chooseCards']>
  ): void {
    this.decisions.chooseCards(...args);
  }

  /** Opens a finite-choice prompt for a special handler. */
  public chooseChoices(
    ...args: Parameters<EffectDecisionManager['chooseChoices']>
  ): void {
    this.decisions.chooseChoices(...args);
  }

  /** Pauses one special handler until a player answers a pending decision. */
  public pauseDecision(
    ...args: Parameters<EffectDecisionManager['pause']>
  ): void {
    this.decisions.pause(...args);
  }

  /** Adds a temporary or persistent power modifier. */
  public addPowerModifier(
    ...args: Parameters<EffectModifierEngine['addPowerModifier']>
  ): void {
    this.modifiers.addPowerModifier(...args);
  }

  /** Adds a temporary or persistent keyword modifier. */
  public addKeywordModifier(
    ...args: Parameters<EffectModifierEngine['addKeywordModifier']>
  ): void {
    this.modifiers.addKeywordModifier(...args);
  }

  /** Adds a temporary or persistent cost modifier. */
  public addCostModifier(
    ...args: Parameters<EffectModifierEngine['addCostModifier']>
  ): void {
    this.modifiers.addCostModifier(...args);
  }

  /** Adds a temporary player-level restriction. */
  public addPlayerRestriction(
    ...args: Parameters<EffectModifierEngine['addPlayerRestriction']>
  ): void {
    this.modifiers.addPlayerRestriction(...args);
  }

  /** Registers a one-shot next-play cost modifier. */
  public registerNextPlayCostModifier(
    ...args: Parameters<EffectModifierEngine['registerNextPlayCostModifier']>
  ): void {
    this.modifiers.registerNextPlayCostModifier(...args);
  }

  /** Opens the standard deck-window arrangement flow for a special handler. */
  public arrangeDeckWindow(
    controllerSessionId: string,
    source: DuelCard,
    amount: number,
    onComplete?: () => void,
  ): void {
    this.actions.resolveActions(
      [
        {
          type: 'arrangeDeckWindow',
          player: 'self',
          amount,
        },
      ],
      controllerSessionId,
      source,
      {
        sourceInstanceId: source.instanceId,
        storedSelections: {},
      },
      0,
      onComplete,
    );
  }

  /** Tests whether a once-per-turn special handler key already resolved. */
  public hasResolvedOncePerTurnKey(key: string): boolean {
    return this.resolvedOncePerTurnKeys.has(key);
  }

  /** Marks a once-per-turn special handler key as resolved. */
  public markResolvedOncePerTurnKey(key: string): void {
    this.resolvedOncePerTurnKeys.add(key);
  }

  /** Returns whether the engine currently carries a non-serializable pause. */
  public hasPendingDecision(): boolean {
    return this.decisions.hasPendingDecision();
  }

  /** Recomputes visible power from printed power plus active continuous modifiers. */
  public reapplyContinuousEffects(): void {
    this.modifiers.reapplyContinuousEffects();
  }

  /** Removes temporary end-of-turn modifiers and refreshes derived values. */
  public clearTurnModifiers(): void {
    this.modifiers.clearTurnModifiers();
  }

  /** Removes modifiers that expire at the start of the given player's turn. */
  public clearTurnStartModifiers(playerSessionId: string): void {
    this.modifiers.clearTurnStartModifiers(playerSessionId);
  }

  /** Removes temporary end-of-battle modifiers and refreshes derived values. */
  public clearCombatModifiers(): void {
    this.modifiers.clearCombatModifiers();
  }

  /** Returns the next-play cost delta currently applicable to a card in hand. */
  public getNextPlayCostModifier(source: DuelCard): number {
    return this.modifiers.getNextPlayCostModifier(source, 'hand');
  }

  /** Consumes the first matching one-shot play-cost modifier for this card. */
  public consumeNextPlayCostModifier(source: DuelCard): void {
    this.modifiers.consumeNextPlayCostModifier(source, 'hand');
  }

  /** Queues and resolves all standard effects matching a gameplay event. */
  public handleEvent(event: EffectEvent): void {
    const source = this.host.getCard(event.sourceInstanceId);

    if (!source) {
      return;
    }

    this.queueTriggeredEffectsForCard(event, source, event.playerSessionId);

    if (this.shouldBroadcastTriggerToOtherCards(event.type)) {
      for (const candidate of this.selectors.collectInPlayCards()) {
        if (candidate.instanceId === source.instanceId) {
          continue;
        }

        this.queueTriggeredEffectsForCard(
          {
            ...event,
            targetInstanceId: event.targetInstanceId ?? source.instanceId,
            targetCardId: event.targetCardId ?? source.cardId,
          },
          candidate,
          candidate.ownerSessionId,
        );
      }
    }

    this.registry.specialHandlersByCardId[event.sourceCardId]?.resolve(
      event,
      this,
    );

    if (event.type === 'onCharacterPlayed') {
      this.broadcastCharacterPlayedToObserverSpecialHandlers(event, source);
    }

    if (event.type === 'onCardRemovedByEffect') {
      this.broadcastRemovedByEffectToObserverSpecialHandlers(event, source);
    }

    if (event.type === 'onTurnEnd') {
      this.flushDelayedTurnEndEffects();
    }

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
      if (
        effect.oncePerTurn &&
        this.resolvedOncePerTurnKeys.has(
          this.getOncePerTurnKey(source.instanceId, effect.id),
        )
      ) {
        continue;
      }

      if (
        !this.conditions.conditionsPass(
          effect.conditions ?? [],
          query.playerSessionId,
          source,
          query,
        )
      ) {
        continue;
      }

      this.host.addLog(`${source.name} applique un effet de remplacement.`);
      this.actions.resolveActions(
        effect.replacement,
        query.playerSessionId,
        source,
        {
          sourceInstanceId: source.instanceId,
          storedSelections: {},
        },
      );
      if (effect.oncePerTurn) {
        this.resolvedOncePerTurnKeys.add(
          this.getOncePerTurnKey(source.instanceId, effect.id),
        );
      }
      return true;
    }

    return false;
  }

  /** Resumes a paused effect after a player answers the pending decision. */
  public answerDecision(response: EffectDecisionResponse): void {
    this.decisions.answerDecision(response);
    this.flushQueue();
  }

  /**
   * Exports the serializable mutable engine state. Pending decision
   * continuations cannot be serialized and therefore are rejected here.
   */
  public exportState(): EffectEngineState {
    if (this.decisions.hasPendingDecision()) {
      throw new Error(
        'EffectEngine cannot export state while a decision continuation is pending.',
      );
    }

    return {
      queue: this.queue.map((queued) => ({
        controllerSessionId: queued.controllerSessionId,
        sourceInstanceId: queued.sourceInstanceId,
        sourceCardId: queued.sourceCardId,
        definition: queued.definition,
        triggeringEvent: queued.triggeringEvent,
      })),
      delayedTurnEndQueue: this.delayedTurnEndQueue.map((queued) => ({
        controllerSessionId: queued.controllerSessionId,
        sourceInstanceId: queued.sourceInstanceId,
        sourceCardId: queued.sourceCardId,
        definition: queued.definition,
        triggeringEvent: queued.triggeringEvent,
      })),
      resolvedOncePerTurnKeys: Array.from(this.resolvedOncePerTurnKeys),
      modifiers: this.modifiers.exportState(),
      cannotRestKeys: Array.from(this._cannotRestKeys ?? []),
    };
  }

  /** Restores a previously exported serializable engine state. */
  public importState(state: EffectEngineState): void {
    this.queue.splice(0, this.queue.length, ...state.queue);
    this.delayedTurnEndQueue.splice(
      0,
      this.delayedTurnEndQueue.length,
      ...state.delayedTurnEndQueue,
    );
    this.resolvedOncePerTurnKeys.clear();
    for (const key of state.resolvedOncePerTurnKeys) {
      this.resolvedOncePerTurnKeys.add(key);
    }
    this.modifiers.importState(state.modifiers);
    this._cannotRestKeys = new Set(state.cannotRestKeys);
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

  /** Queues authored actions to resolve at the end of the current turn. */
  public scheduleTurnEndActions(
    controllerSessionId: string,
    source: DuelCard,
    actions: StandardEffectDefinition['actions'],
  ): void {
    this.delayedTurnEndQueue.push({
      controllerSessionId,
      sourceInstanceId: source.instanceId,
      sourceCardId: source.cardId,
      sourceCard: source,
      definition: {
        id: `${source.instanceId}:${source.cardId}:scheduled-turn-end:${this.delayedTurnEndQueue.length}`,
        text: '',
        trigger: { type: 'onTurnEnd' },
        actions,
      },
    });
  }

  private flushQueue(): void {
    while (this.queue.length > 0 && !this.decisions.hasPendingDecision()) {
      const queued = this.queue.shift();

      if (!queued) {
        continue;
      }

      const source =
        queued.sourceCard ?? this.host.getCard(queued.sourceInstanceId);

      if (!source) {
        continue;
      }

      if (queued.definition.trigger.optional) {
        const decisionId = `${queued.sourceInstanceId}:${queued.definition.id}:optional`;
        this.decisions.pause(
          {
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
          (response) => {
            if (response.confirmed) {
              this.resolveStandardEffect(
                queued.definition,
                queued.controllerSessionId,
                source,
                queued.triggeringEvent,
              );
            }
          },
        );
        return;
      }

      this.resolveStandardEffect(
        queued.definition,
        queued.controllerSessionId,
        source,
        queued.triggeringEvent,
      );
    }
  }

  private resolveStandardEffect(
    definition: StandardEffectDefinition,
    controllerSessionId: string,
    source: DuelCard,
    triggeringEvent?: EffectEvent,
  ): void {
    if (
      !this.actions.canPayCosts(definition.costs ?? [], controllerSessionId)
    ) {
      return;
    }

    const runActions = () => {
      if (definition.trigger.oncePerTurn) {
        this.resolvedOncePerTurnKeys.add(
          this.getOncePerTurnKey(source.instanceId, definition.id),
        );
      }

      this.actions.resolveActions(
        definition.actions,
        controllerSessionId,
        source,
        {
          sourceInstanceId: source.instanceId,
          storedSelections: {},
          eventTargetInstanceId: triggeringEvent?.targetInstanceId,
          triggeringEvent,
        },
      );
    };

    if (!definition.costs || definition.costs.length === 0) {
      runActions();
      return;
    }

    this.actions.resolveActions(
      definition.costs,
      controllerSessionId,
      source,
      {
        sourceInstanceId: source.instanceId,
        storedSelections: {},
        eventTargetInstanceId: triggeringEvent?.targetInstanceId,
        triggeringEvent,
      },
      0,
      runActions,
    );
  }

  private flushDelayedTurnEndEffects(): void {
    while (
      this.delayedTurnEndQueue.length > 0 &&
      !this.decisions.hasPendingDecision()
    ) {
      const queued = this.delayedTurnEndQueue.shift();

      if (!queued) {
        continue;
      }

      this.queue.push(queued);
    }
  }

  /**
   * Only true observer-style windows should be evaluated against every card in play.
   * Source-bound windows like [On Play] or [When Attacking] must stay attached to
   * the card that actually caused the event, otherwise unrelated cards can retrigger.
   */
  private shouldBroadcastTriggerToOtherCards(type: EffectEventType): boolean {
    return (
      type === 'onEventActivated' ||
      type === 'onCardRemovedByEffect' ||
      type === 'onCharacterPlayed' ||
      type === 'onDonAttached' ||
      type === 'onDonReturned' ||
      type === 'onBattleKo' ||
      type === 'onLifeDamageDealt' ||
      type === 'onCardDrawn' ||
      type === 'onKo'
    );
  }

  private broadcastCharacterPlayedToObserverSpecialHandlers(
    event: EffectEvent,
    playedCard: DuelCard,
  ): void {
    for (const candidate of this.selectors.collectInPlayCards()) {
      if (candidate.instanceId === playedCard.instanceId) {
        continue;
      }

      const handler = this.registry.specialHandlersByCardId[candidate.cardId];

      if (!handler) {
        continue;
      }

      handler.resolve(
        {
          ...event,
          sourceInstanceId: candidate.instanceId,
          sourceCardId: candidate.cardId,
          targetInstanceId: event.targetInstanceId ?? playedCard.instanceId,
          targetCardId: event.targetCardId ?? playedCard.cardId,
        },
        this,
      );
    }
  }

  private broadcastRemovedByEffectToObserverSpecialHandlers(
    event: EffectEvent,
    removedCard: DuelCard,
  ): void {
    for (const candidate of this.selectors.collectInPlayCards()) {
      if (candidate.instanceId === removedCard.instanceId) {
        continue;
      }

      const handler = this.registry.specialHandlersByCardId[candidate.cardId];

      if (!handler) {
        continue;
      }

      handler.resolve(
        {
          ...event,
          sourceInstanceId: candidate.instanceId,
          sourceCardId: candidate.cardId,
          targetInstanceId: event.targetInstanceId ?? removedCard.instanceId,
          targetCardId: event.targetCardId ?? removedCard.cardId,
        },
        this,
      );
    }
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
        !this.conditions.conditionsPass(
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
        triggeringEvent: event,
      });
    }
  }

  private getOncePerTurnKey(
    sourceInstanceId: string,
    effectId: string,
  ): string {
    return `${sourceInstanceId}:${effectId}:${this.host.state.turn}`;
  }
}
