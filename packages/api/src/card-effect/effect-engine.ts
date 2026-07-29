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
  EffectEngineHost,
  EffectEvent,
  EffectEventType,
  QueuedEffect,
  ReplacementQuery,
} from './runtime/effect-engine-types';
import type { EffectRegistry } from './types/effect-registry';

export type {
  EffectEngineHost,
  EffectEvent,
  EffectEventType,
  ReplacementQuery,
} from './runtime/effect-engine-types';

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
      (type, playerSessionId, source) => {
        this.handleEvent({
          type,
          playerSessionId,
          sourceInstanceId: source.instanceId,
          sourceCardId: source.cardId,
        });
      },
    );
  }

  /** Serializes the pending player choice, if the resolver is paused on one. */
  public getPendingDecision() {
    return this.decisions.getPendingDecision();
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
          event,
          candidate,
          candidate.ownerSessionId,
        );
      }
    }

    this.registry.specialHandlersByCardId[event.sourceCardId]?.resolve(
      event,
      this,
    );

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
      );
    }
  }

  private resolveStandardEffect(
    definition: StandardEffectDefinition,
    controllerSessionId: string,
    source: DuelCard,
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
      { sourceInstanceId: source.instanceId, storedSelections: {} },
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
      type === 'onCharacterPlayed' ||
      type === 'onDonAttached' ||
      type === 'onDonReturned' ||
      type === 'onBattleKo' ||
      type === 'onLifeDamageDealt' ||
      type === 'onCardDrawn' ||
      type === 'onTurnStart' ||
      type === 'onTurnEnd' ||
      type === 'onKo'
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
