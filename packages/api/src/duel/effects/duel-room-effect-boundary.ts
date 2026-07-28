import type {
  DuelCard,
  DuelPlayer,
  EffectDecisionResponse,
} from '@onepiecetcg/shared';
import {
  EffectEngine,
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

  public clearCombatModifiers(): void {
    this.engine.clearCombatModifiers();
    this.manualTriggers.clear();
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

  public emitCardEvent(
    type: EffectEventType,
    playerSessionId: string,
    card: DuelCard,
  ): void {
    this.engine.handleEvent({
      type,
      playerSessionId,
      sourceInstanceId: card.instanceId,
      sourceCardId: card.cardId,
    });
  }

  public emitWindowEffects(type: 'onTurnStart' | 'onTurnEnd'): void {
    this.dispatcher.emitWindowEffects(type);
  }

  public emitPlayedCard(playerSessionId: string, card: DuelCard): void {
    this.dispatcher.emitPlayedCard(playerSessionId, card);
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
