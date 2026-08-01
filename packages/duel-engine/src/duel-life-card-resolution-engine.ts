import type { DuelCard, DuelPlayer } from '@onepiecetcg/shared';

/**
 * Dependencies required to resolve a revealed life card.
 */
export type DuelLifeCardResolutionEngineDeps = {
  addLog: (message: string) => void;
  syncPlayer: (playerSessionId: string) => void;
  moveCard: (
    card: DuelCard,
    destinationPlayerSessionId: string,
    destinationZone: string,
    options?: { faceDown?: boolean; rested?: boolean; toBottom?: boolean },
  ) => void;
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
   * Resolves a revealed life card into hand, trigger pipeline, or manual
   * fallback depending on authored support.
   */
  public resolve(
    defender: DuelPlayer,
    revealedCard: DuelCard,
  ): 'addedToHand' | 'engineTrigger' | 'manualFallback' {
    if (this.deps.hasLocalTriggerDefinition(revealedCard.cardId)) {
      this.deps.moveCard(revealedCard, defender.sessionId, 'trash');
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

    this.deps.moveCard(revealedCard, defender.sessionId, 'hand');
    this.deps.addLog(
      `${defender.displayName} subit 1 degat et ajoute la carte de Vie a sa main.`,
    );
    return 'addedToHand';
  }
}
