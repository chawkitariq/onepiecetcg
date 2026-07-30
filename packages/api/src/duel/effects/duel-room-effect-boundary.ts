import type {
  DuelCard,
  DuelPlayer,
  EffectDecisionResponse,
} from '@onepiecetcg/shared';
import {
  EffectEngine,
  type EffectEvent,
  type EffectEventType,
} from '../../card-effect/effect-engine';
import { effectRegistry } from '../../card-effect/effect-registry';
import {
  createDuelEffectEngineHost,
  type DuelEffectEngineHostDeps,
} from './duel-effect-engine-host';
import { DuelEffectEventDispatcher } from './duel-effect-event-dispatcher';
import { DuelLifeCardResolutionEngine } from './duel-life-card-resolution-engine';
import { DuelManualTriggerManager } from './duel-manual-trigger-manager';

export type DuelRoomEffectBoundaryDeps = DuelEffectEngineHostDeps & {
  broadcastCardView: (card: DuelCard) => void;
};

export type DuelRoomEffectBoundaryState = {
  engine: import('../../card-effect/runtime/effect-engine-types').EffectEngineState;
  manualTrigger:
    | import('./duel-manual-trigger-manager').SerializedManualTriggerFallbackState
    | null;
};

/**
 * Explicit API boundary between Colyseus duel orchestration and the card
 * effect engine. `DuelRoom` keeps structural combat/state rules; this class
 * translates gameplay windows into effect events and isolates the temporary
 * manual Trigger fallback for cards that still lack a local definition.
 */
export class DuelRoomEffectBoundary {
  private readonly engine: EffectEngine;

  private readonly manualTriggers: DuelManualTriggerManager;

  private readonly lifeCards: DuelLifeCardResolutionEngine;

  private readonly dispatcher: DuelEffectEventDispatcher;

  public constructor(private readonly deps: DuelRoomEffectBoundaryDeps) {
    this.engine = new EffectEngine(
      effectRegistry,
      createDuelEffectEngineHost(deps),
    );
    this.dispatcher = new DuelEffectEventDispatcher({
      state: deps.state,
      emitCardEvent: (type, playerSessionId, card) =>
        this.emitCardEvent(type, playerSessionId, card),
    });
    this.manualTriggers = new DuelManualTriggerManager({
      state: deps.state,
      addLog: deps.addLog,
      getPlayer: deps.getPlayer,
      syncPlayer: deps.syncPlayer,
      broadcastCardView: deps.broadcastCardView,
    });
    this.lifeCards = new DuelLifeCardResolutionEngine({
      addLog: deps.addLog,
      syncPlayer: deps.syncPlayer,
      broadcastCardView: deps.broadcastCardView,
      hasLocalTriggerDefinition: (cardId) =>
        this.dispatcher.hasLocalTriggerDefinition(cardId),
      emitTriggerEvent: (playerSessionId, card) =>
        this.emitCardEvent('trigger', playerSessionId, card),
      queueManualTriggerFallback: (ownerSessionId, card, defenderDisplayName) =>
        this.manualTriggers.queueLifeCardFallback(
          ownerSessionId,
          card,
          defenderDisplayName,
        ),
    });
  }

  public hasPendingPlayerInteraction(): boolean {
    return (
      this.getPendingEffectDecision() !== null ||
      this.manualTriggers.hasPendingInteraction()
    );
  }

  public getPendingEffectDecision() {
    return this.engine.getPendingDecision();
  }

  public answerEffectDecision(response: EffectDecisionResponse): void {
    this.engine.answerDecision(response);
  }

  public reapplyContinuousEffects(): void {
    this.engine.reapplyContinuousEffects();
  }

  public clearTurnModifiers(): void {
    this.engine.clearTurnModifiers();
  }

  public clearTurnStartModifiers(playerSessionId: string): void {
    this.engine.clearTurnStartModifiers(playerSessionId);
  }

  public clearCombatModifiers(): void {
    this.engine.clearCombatModifiers();
    this.manualTriggers.clear();
  }

  /** Exports the serializable mutable boundary state. */
  public exportState(): DuelRoomEffectBoundaryState {
    return {
      engine: this.engine.exportState(),
      manualTrigger: this.manualTriggers.exportState(),
    };
  }

  /** Restores a previously exported mutable boundary state. */
  public importState(state: DuelRoomEffectBoundaryState): void {
    this.engine.importState(state.engine);
    this.manualTriggers.importState(state.manualTrigger);
  }

  /** Returns the serializable pending manual Trigger fallback state, if any. */
  public getPendingManualTriggerState() {
    return this.manualTriggers.exportState();
  }

  public applyKoReplacement(
    playerSessionId: string,
    sourceInstanceId: string,
    reason: 'battle' | 'effect',
  ): boolean {
    return this.engine.applyReplacement({
      type: 'wouldKoCharacter',
      playerSessionId,
      sourceInstanceId,
      reason,
    });
  }

  /**
   * Applies a replacement effect before a card moves from one zone to another.
   */
  public applyMoveReplacement(
    playerSessionId: string,
    sourceInstanceId: string,
    destinationPlayerSessionId: string,
    destinationZone: string,
  ): boolean {
    return this.engine.applyReplacement({
      type: 'wouldMoveCard',
      playerSessionId,
      sourceInstanceId,
      destinationPlayerSessionId,
      destinationZone,
    });
  }

  public emitCardEvent(
    type: EffectEventType,
    playerSessionId: string,
    card: DuelCard,
    context?: Pick<
      EffectEvent,
      'sourceZone' | 'targetInstanceId' | 'targetCardId' | 'playedByEffect'
    >,
  ): void {
    this.engine.handleEvent({
      type,
      playerSessionId,
      sourceInstanceId: card.instanceId,
      sourceCardId: card.cardId,
      ...context,
    });
  }

  public emitWindowEffects(
    type: 'onTurnStart' | 'onTurnEnd',
    playerSessionId: string,
  ): void {
    this.dispatcher.emitWindowEffects(type, playerSessionId);
  }

  public emitPlayedCard(
    playerSessionId: string,
    card: DuelCard,
    sourceZone: EffectEvent['sourceZone'] = 'hand',
  ): void {
    this.dispatcher.emitPlayedCard(playerSessionId, card, sourceZone);
  }

  public emitDonAttached(playerSessionId: string, card: DuelCard): void {
    this.emitCardEvent('onDonAttached', playerSessionId, card);
  }

  public emitDonReturned(playerSessionId: string, card: DuelCard): void {
    this.emitCardEvent('onDonReturned', playerSessionId, card);
  }

  public emitBattleKo(playerSessionId: string, card: DuelCard): void {
    this.emitCardEvent('onBattleKo', playerSessionId, card);
  }

  public getNextPlayCostModifier(card: DuelCard): number {
    return this.engine.getNextPlayCostModifier(card);
  }

  public consumeNextPlayCostModifier(card: DuelCard): void {
    this.engine.consumeNextPlayCostModifier(card);
  }

  public hasCounterEffect(cardId: string): boolean {
    return this.dispatcher.hasCounterEffect(cardId);
  }

  public emitCounterUsage(playerSessionId: string, card: DuelCard): void {
    this.dispatcher.emitCounterUsage(playerSessionId, card);
  }

  public hasLocalTriggerDefinition(cardId: string): boolean {
    return this.dispatcher.hasLocalTriggerDefinition(cardId);
  }

  public resolveRevealedLifeCard(
    defender: DuelPlayer,
    revealedCard: DuelCard,
  ): 'addedToHand' | 'engineTrigger' | 'manualFallback' {
    return this.lifeCards.resolve(defender, revealedCard);
  }

  public resolveManualTriggerDecision(
    playerSessionId: string,
    activate: boolean,
  ): { ok: true } | { ok: false; error: string } {
    return this.manualTriggers.resolveDecision(playerSessionId, activate);
  }
}
