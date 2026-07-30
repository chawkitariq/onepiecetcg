import { ArraySchema } from '@colyseus/schema';
import type { DuelCard, DuelPlayer } from '@onepiecetcg/shared';

/**
 * Dependencies required to resolve a revealed life card.
 */
export type DuelLifeCardResolutionEngineDeps = {
  addLog: (message: string) => void;
  syncPlayer: (playerSessionId: string) => void;
  broadcastCardView: (card: DuelCard) => void;
  hasLocalTriggerDefinition: (cardId: string) => boolean;
  emitTriggerEvent: (playerSessionId: string, card: DuelCard) => void;
  queueManualTriggerFallback: (
    ownerSessionId: string,
    card: DuelCard,
    defenderDisplayName: string,
  ) => void;
};

/**
 * Resolves the outcome of a life card reveal independently from the larger
 * effect boundary orchestration.
 */
export class DuelLifeCardResolutionEngine {
  public constructor(private readonly deps: DuelLifeCardResolutionEngineDeps) {}

  /**
   * Prepends a moved card without detaching its Colyseus change tree.
   */
  private unshiftIntoZone(zone: ArraySchema<DuelCard>, card: DuelCard): void {
    zone.push(card);
    zone.move(() => {
      for (let index = zone.length - 1; index > 0; index -= 1) {
        [zone[index], zone[index - 1]] = [zone[index - 1], zone[index]];
      }
    });
  }

  /**
   * Resolves a revealed life card into hand, trigger pipeline, or manual
   * fallback depending on authored support.
   */
  public resolve(
    defender: DuelPlayer,
    revealedCard: DuelCard,
  ): 'addedToHand' | 'engineTrigger' | 'manualFallback' {
    if (this.deps.hasLocalTriggerDefinition(revealedCard.cardId)) {
      this.unshiftIntoZone(defender.zones.trash, revealedCard);
      this.deps.broadcastCardView(revealedCard);
      this.deps.emitTriggerEvent(defender.sessionId, revealedCard);
      return 'engineTrigger';
    }

    if (revealedCard.trigger) {
      this.deps.queueManualTriggerFallback(
        defender.sessionId,
        revealedCard,
        defender.displayName,
      );
      return 'manualFallback';
    }

    defender.zones.hand.push(revealedCard);
    this.deps.syncPlayer(defender.sessionId);
    this.deps.addLog(
      `${defender.displayName} subit 1 degat et ajoute la carte de Vie a sa main.`,
    );
    return 'addedToHand';
  }
}
