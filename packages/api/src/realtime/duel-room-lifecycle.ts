import type { DuelEndReason, DuelPlayer, DuelState } from '@onepiecetcg/shared';
import type { StatsService } from '../stats/stats.service';

/**
 * Dependencies required to manage non-gameplay room lifecycle concerns such as
 * player registration, match finalization, and stats persistence.
 */
export type DuelRoomLifecycleDeps = {
  state: DuelState;
  statsService?: StatsService;
  addLog: (message: string) => void;
  getOpponentSessionId: (sessionId: string) => string | null;
  disconnectRoom: () => Promise<void> | void;
  reportStatsError: (error: unknown) => void;
};

/**
 * Owns room-level lifecycle state that is orthogonal to gameplay engines:
 * joined users, match start/end bookkeeping, and match-result recording.
 */
export class DuelRoomLifecycle {
  private readonly authUserIdBySession = new Map<string, string>();

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
  public registerPlayer(sessionId: string, authUserId: string): void {
    this.authUserIdBySession.set(sessionId, authUserId);
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
   * progress, then records the result exactly as for other clean game ends.
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
    this.deps.addLog(`${quittingPlayer.displayName} abandonne la partie.`);
    this.recordMatchResult();
  }

  /**
   * Persists a match result once for a clean structural game-end.
   */
  public recordMatchResult(): void {
    if (this.matchResultRecorded || !this.matchStartedAt) {
      return;
    }

    const winnerSessionId = this.deps.state.winnerSessionId;
    const endReason = this.deps.state.endReason;
    const winner = this.deps.state.players.get(winnerSessionId);
    const loserSessionId = this.deps.getOpponentSessionId(winnerSessionId);
    const loser = loserSessionId
      ? this.deps.state.players.get(loserSessionId)
      : undefined;
    const winnerAuthUserId = this.authUserIdBySession.get(winnerSessionId);
    const loserAuthUserId = loserSessionId
      ? this.authUserIdBySession.get(loserSessionId)
      : undefined;

    if (
      !this.deps.statsService ||
      !winner ||
      !loser ||
      !winnerAuthUserId ||
      !loserAuthUserId ||
      (endReason !== 'life' &&
        endReason !== 'deckOut' &&
        endReason !== 'forfeit')
    ) {
      return;
    }

    this.matchResultRecorded = true;

    void this.deps.statsService
      .recordMatchResult({
        winnerAuthUserId,
        loserAuthUserId,
        winnerDeckId: winner.deckId || null,
        loserDeckId: loser.deckId || null,
        winnerLeaderCardId: winner.zones.leader.cardId,
        loserLeaderCardId: loser.zones.leader.cardId,
        winnerWentFirst:
          this.deps.state.firstPlayerSessionId === winnerSessionId,
        endReason,
        startedAt: this.matchStartedAt ?? new Date(),
        endedAt: new Date(),
      })
      .catch((error: unknown) => {
        this.deps.reportStatsError(error);
      });
  }

  /**
   * Removes a player seat from the room and disconnects the room when empty.
   */
  public removePlayer(sessionId: string): void {
    this.deps.state.players.delete(sessionId);
    this.authUserIdBySession.delete(sessionId);

    if (this.deps.state.players.size === 0) {
      void this.deps.disconnectRoom();
    }
  }
}
