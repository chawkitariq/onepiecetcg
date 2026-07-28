import type {
  DuelCard,
  DuelPlayer,
  EffectDecisionResponse,
} from '@onepiecetcg/shared';
import {
  EffectEngine,
  type EffectEventType,
} from '../card-effect/effect-engine';
import { effectRegistry } from '../card-effect/effect-registry';
import {
  createDuelEffectEngineHost,
  type DuelEffectEngineHostDeps,
} from './duel-effect-engine-host';
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

  public constructor(private readonly deps: DuelRoomEffectBoundaryDeps) {
    this.engine = new EffectEngine(
      effectRegistry,
      createDuelEffectEngineHost(deps),
    );
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
        this.hasLocalTriggerDefinition(cardId),
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
    for (const player of this.deps.state.players.values()) {
      this.emitCardEvent(type, player.sessionId, player.zones.leader);

      for (const character of player.zones.characters) {
        this.emitCardEvent(type, player.sessionId, character);
      }

      if (player.zones.stage.instanceId) {
        this.emitCardEvent(type, player.sessionId, player.zones.stage);
      }
    }
  }

  public emitPlayedCard(playerSessionId: string, card: DuelCard): void {
    if (card.type === 'Event') {
      this.emitCardEvent('activateMain', playerSessionId, card);
      this.emitCardEvent('onEventActivated', playerSessionId, card);
      return;
    }

    this.emitCardEvent('onPlay', playerSessionId, card);
  }

  public hasCounterEffect(cardId: string): boolean {
    return (
      effectRegistry.effectsByCardId[cardId]?.standard?.some(
        (effect) => effect.trigger.type === 'activateCounter',
      ) ?? false
    );
  }

  public emitCounterUsage(playerSessionId: string, card: DuelCard): void {
    if (this.hasCounterEffect(card.cardId)) {
      this.emitCardEvent('activateCounter', playerSessionId, card);
    }

    if (card.type === 'Event') {
      this.emitCardEvent('onEventActivated', playerSessionId, card);
    }
  }

  public hasLocalTriggerDefinition(cardId: string): boolean {
    return (
      effectRegistry.effectsByCardId[cardId]?.standard?.some(
        (effect) => effect.trigger.type === 'trigger',
      ) ?? false
    );
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
