import type { DuelEndReason, DuelPlayer, DuelState } from '@onepiecetcg/shared';

/**
 * Dependencies required to manage non-gameplay room lifecycle concerns such as
 * player registration and match finalization.
 */
export type DuelRoomLifecycleDeps = {
  state: DuelState;
  addLog: (message: string, actorSessionId?: string) => void;
  getOpponentSessionId: (sessionId: string) => string | null;
  disconnectRoom: () => Promise<void> | void;
};

export type DuelRoomLifecycleState = {
  authUserIdBySession: Array<[string, string]>;
  playerIdBySession: Array<[string, string]>;
  nextPlayerOrdinal: number;
  matchStartedAt: string | null;
  matchResultRecorded: boolean;
};

/**
 * Owns room-level lifecycle state that is orthogonal to gameplay engines:
 * joined users, match start/end bookkeeping, and match-result recording.
 */
export class DuelRoomLifecycle {
  private readonly authUserIdBySession = new Map<string, string>();

  private readonly playerIdBySession = new Map<string, string>();

  private nextPlayerOrdinal = 1;

  private matchStartedAt: Date | null = null;

  private matchResultRecorded = false;

  public constructor(private readonly deps: DuelRoomLifecycleDeps) {}

  /**
   * Returns whether an authenticated user already occupies a seat in the room.
   */
  public hasJoined(authUserId: string): boolean {
    return Array.from(this.authUserIdBySession.values()).includes(authUserId);
  }

  /**
   * Registers the authenticated owner of a joined player seat.
   */
  public registerPlayer(sessionId: string, authUserId: string): string {
    this.authUserIdBySession.set(sessionId, authUserId);
    const playerId = `player-${this.nextPlayerOrdinal}`;

    this.playerIdBySession.set(sessionId, playerId);
    this.nextPlayerOrdinal += 1;

    return playerId;
  }

  /**
   * Returns the stable duel-local player identifier for the current seat.
   */
  public getPlayerId(sessionId: string): string | undefined {
    return this.playerIdBySession.get(sessionId);
  }

  /** Returns the current auth-user/player bindings for stream authorization. */
  public listParticipants(): Array<{ authUserId: string; playerId: string }> {
    return Array.from(this.authUserIdBySession.entries()).flatMap(
      ([sessionId, authUserId]) => {
        const playerId = this.playerIdBySession.get(sessionId);

        return playerId ? [{ authUserId, playerId }] : [];
      },
    );
  }

  /**
   * Records the actual match start time once mulligans are finished.
   */
  public markMatchStarted(startedAt: Date): void {
    this.matchStartedAt = startedAt;
  }

  /**
   * Marks the duel finished and stamps replicated end metadata.
   */
  public finalizeMatch(
    endReason: DuelEndReason,
    winnerSessionId: string,
  ): void {
    this.deps.state.phase = 'finished';
    this.deps.state.endReason = endReason;
    this.deps.state.winnerSessionId = winnerSessionId;
    this.deps.state.finishedAt = new Date().toISOString();
  }

  /**
   * Applies a consented-leave forfeit only when the match is structurally in
   * progress.
   */
  public declareForfeitIfMatchInProgress(quittingPlayer: DuelPlayer): void {
    if (
      this.deps.state.phase === 'finished' ||
      this.deps.state.phase === 'setup' ||
      this.deps.state.phase === 'mulligan' ||
      !this.matchStartedAt
    ) {
      return;
    }

    const winnerSessionId = this.deps.getOpponentSessionId(
      quittingPlayer.sessionId,
    );

    if (!winnerSessionId) {
      return;
    }

    this.finalizeMatch('forfeit', winnerSessionId);
    this.deps.addLog(
      `${quittingPlayer.displayName} abandonne la partie.`,
      quittingPlayer.sessionId,
    );
  }

  public recordMatchResult(): void {
    return;
  }

  /**
   * Removes a player seat from the room and disconnects the room when empty.
   */
  public removePlayer(sessionId: string): void {
    this.deps.state.players.delete(sessionId);
    this.authUserIdBySession.delete(sessionId);
    this.playerIdBySession.delete(sessionId);

    if (this.deps.state.players.size === 0) {
      void this.deps.disconnectRoom();
    }
  }

  /** Exports the mutable room-lifecycle state for a future replay/adoption. */
  public exportState(): DuelRoomLifecycleState {
    return {
      authUserIdBySession: Array.from(this.authUserIdBySession.entries()),
      playerIdBySession: Array.from(this.playerIdBySession.entries()),
      nextPlayerOrdinal: this.nextPlayerOrdinal,
      matchStartedAt: this.matchStartedAt?.toISOString() ?? null,
      matchResultRecorded: this.matchResultRecorded,
    };
  }

  /** Restores the mutable room-lifecycle state from a previous snapshot. */
  public importState(state: DuelRoomLifecycleState): void {
    this.authUserIdBySession.clear();
    for (const [sessionId, authUserId] of state.authUserIdBySession) {
      this.authUserIdBySession.set(sessionId, authUserId);
    }

    this.playerIdBySession.clear();
    for (const [sessionId, playerId] of state.playerIdBySession) {
      this.playerIdBySession.set(sessionId, playerId);
    }

    this.nextPlayerOrdinal = state.nextPlayerOrdinal;
    this.matchStartedAt = state.matchStartedAt
      ? new Date(state.matchStartedAt)
      : null;
    this.matchResultRecorded = state.matchResultRecorded;
  }
}
