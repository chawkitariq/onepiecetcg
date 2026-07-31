import type { DuelCard, DuelState } from '@onepiecetcg/shared';
import type { EffectEvent, EffectEventType } from '@onepiecetcg/effect-engine';
import { effectRegistry } from '../../card-effect/effect-registry';

/**
 * Dependencies required to translate duel gameplay windows into effect-engine
 * events while keeping that policy separate from the higher-level boundary.
 */
export type DuelEffectEventDispatcherDeps = {
  state: DuelState;
  emitCardEvent: (
    type: EffectEventType,
    playerSessionId: string,
    card: DuelCard,
    context?: Pick<
      EffectEvent,
      'sourceZone' | 'targetInstanceId' | 'targetCardId' | 'playedByEffect'
    >,
  ) => void;
};

/**
 * Encapsulates how structural duel events map to authored card-effect
 * triggers and registry lookups.
 */
export class DuelEffectEventDispatcher {
  public constructor(private readonly deps: DuelEffectEventDispatcherDeps) {}

  /**
   * Emits a turn-window event for every public permanent controlled by one
   * player currently in play.
   */
  public emitWindowEffects(
    type: 'onTurnStart' | 'onTurnEnd',
    playerSessionId: string,
  ): void {
    const player = this.deps.state.players.get(playerSessionId);

    if (!player) {
      return;
    }

    this.deps.emitCardEvent(type, player.sessionId, player.zones.leader);

    for (const character of player.zones.characters) {
      this.deps.emitCardEvent(type, player.sessionId, character);
    }

    if (player.zones.stage.instanceId) {
      this.deps.emitCardEvent(type, player.sessionId, player.zones.stage);
    }
  }

  /**
   * Emits the correct effect events when a card is played from hand.
   */
  public emitPlayedCard(
    playerSessionId: string,
    card: DuelCard,
    sourceZone: EffectEvent['sourceZone'] = 'hand',
  ): void {
    if (card.type === 'Event') {
      this.deps.emitCardEvent('activateMain', playerSessionId, card, {
        sourceZone,
        playedByEffect: false,
      });
      this.deps.emitCardEvent('onEventActivated', playerSessionId, card, {
        sourceZone,
        playedByEffect: false,
      });
      return;
    }

    if (card.type === 'Character') {
      this.deps.emitCardEvent('onCharacterPlayed', playerSessionId, card, {
        sourceZone,
        playedByEffect: false,
      });
    }

    this.deps.emitCardEvent('onPlay', playerSessionId, card, {
      sourceZone,
      playedByEffect: false,
    });
  }

  /**
   * Returns whether the card has an authored counter effect in the registry.
   */
  public hasCounterEffect(cardId: string): boolean {
    return this.hasTriggerType(cardId, 'activateCounter');
  }

  /**
   * Emits counter-related events for a counter card that was just used.
   */
  public emitCounterUsage(playerSessionId: string, card: DuelCard): void {
    if (this.hasCounterEffect(card.cardId)) {
      this.deps.emitCardEvent('activateCounter', playerSessionId, card);
    }

    if (card.type === 'Event') {
      this.deps.emitCardEvent('onEventActivated', playerSessionId, card);
    }
  }

  /**
   * Returns whether the card has an authored Trigger definition locally.
   */
  public hasLocalTriggerDefinition(cardId: string): boolean {
    return this.hasTriggerType(cardId, 'trigger');
  }

  private hasTriggerType(
    cardId: string,
    triggerType: EffectEventType,
  ): boolean {
    return (
      effectRegistry.effectsByCardId[cardId]?.standard?.some(
        (effect) => effect.trigger.type === triggerType,
      ) ?? false
    );
  }
}
