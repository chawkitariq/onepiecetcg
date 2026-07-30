import type { DuelCard, DuelPlayer, DuelState } from '@onepiecetcg/shared';

type ManualTriggerFallbackState = {
  card: DuelCard;
  ownerSessionId: string;
};

export type SerializedManualTriggerFallbackState = {
  card: DuelCard;
  ownerSessionId: string;
};

/**
 * Dependencies required by the manual trigger fallback manager.
 */
export type DuelManualTriggerManagerDeps = {
  state: DuelState;
  addLog: (message: string) => void;
  getPlayer: (sessionId: string) => DuelPlayer | undefined;
  syncPlayer: (playerSessionId: string) => void;
  broadcastCardView: (card: DuelCard) => void;
};

/**
 * Owns the temporary manual trigger fallback for life cards whose trigger
 * exists on the card text but is not yet implemented by the local DSL.
 */
export class DuelManualTriggerManager {
  private pendingManualTrigger: ManualTriggerFallbackState | null = null;

  public constructor(private readonly deps: DuelManualTriggerManagerDeps) {}

  /**
   * Returns whether a manual trigger fallback decision is currently pending.
   */
  public hasPendingInteraction(): boolean {
    return this.pendingManualTrigger !== null;
  }

  /**
   * Queues a manual fallback decision for a revealed life card.
   */
  public queueFallback(
    ownerSessionId: string,
    card: DuelCard,
    defenderDisplayName: string,
  ): void {
    this.deps.state.combat.awaitingTriggerDecision = true;
    this.pendingManualTrigger = { card, ownerSessionId };
    this.deps.addLog(
      `${defenderDisplayName} subit 1 degat et revele une carte avec [Declenchement] : decision en attente.`,
    );
  }

  /**
   * Public alias used by higher-level orchestrators when life-card resolution
   * needs to defer to the manual trigger fallback.
   */
  public queueLifeCardFallback(
    ownerSessionId: string,
    card: DuelCard,
    defenderDisplayName: string,
  ): void {
    this.queueFallback(ownerSessionId, card, defenderDisplayName);
  }

  /**
   * Resolves the queued manual fallback decision for the defending player.
   */
  public resolveDecision(
    playerSessionId: string,
    activate: boolean,
  ): { ok: true } | { ok: false; error: string } {
    if (!this.pendingManualTrigger) {
      return {
        ok: false,
        error: 'Aucune decision de Declenchement en attente.',
      };
    }

    if (this.pendingManualTrigger.ownerSessionId !== playerSessionId) {
      return {
        ok: false,
        error: "Seul le defenseur peut decider d'activer ce Declenchement.",
      };
    }

    const defender = this.deps.getPlayer(playerSessionId);
    const { card } = this.pendingManualTrigger;

    if (!defender) {
      this.clear();
      return { ok: true };
    }

    if (activate) {
      defender.zones.trash.unshift(card);
      this.deps.broadcastCardView(card);
      this.deps.addLog(
        `${defender.displayName} active le Declenchement de ${card.name} et l'ecarte (effet a appliquer manuellement).`,
      );
    } else {
      defender.zones.hand.push(card);
      this.deps.addLog(
        `${defender.displayName} ajoute ${card.name} a sa main sans activer le Declenchement.`,
      );
    }

    this.deps.syncPlayer(defender.sessionId);
    this.clear();
    return { ok: true };
  }

  /**
   * Clears any pending manual fallback state.
   */
  public clear(): void {
    this.deps.state.combat.awaitingTriggerDecision = false;
    this.pendingManualTrigger = null;
  }

  /** Exports the pending manual trigger fallback state, if any. */
  public exportState(): SerializedManualTriggerFallbackState | null {
    if (!this.pendingManualTrigger) {
      return null;
    }

    return {
      card: this.pendingManualTrigger.card,
      ownerSessionId: this.pendingManualTrigger.ownerSessionId,
    };
  }

  /** Restores the pending manual trigger fallback state from a snapshot. */
  public importState(state: SerializedManualTriggerFallbackState | null): void {
    if (!state) {
      this.clear();
      return;
    }

    this.deps.state.combat.awaitingTriggerDecision = true;
    this.pendingManualTrigger = {
      card: state.card,
      ownerSessionId: state.ownerSessionId,
    };
  }
}
