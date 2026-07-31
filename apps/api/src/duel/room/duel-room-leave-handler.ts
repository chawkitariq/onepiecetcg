import type {
  DuelLogLevel,
  DuelState,
} from '@onepiecetcg/shared';
import { adoptRoomDuelState, cloneRoomDuelState } from '@onepiecetcg/duel-engine';
import type { Client } from 'colyseus';
import type { DuelRoomLifecycle } from './duel-room-lifecycle';

export type DuelRoomLeaveClient = Pick<Client, 'sessionId'>;

/**
 * Dependencies required to resolve room-leave flows without keeping the whole
 * orchestration inline inside `DuelRoom`.
 */
export type DuelRoomLeaveHandlerDeps = {
  state: DuelState;
  getLifecycle: () => DuelRoomLifecycle;
  allowReconnection: (
    client: Client,
    seconds: number,
  ) => PromiseLike<unknown>;
  createLifecycleForState: (
    state: DuelState,
    options?: { isolated?: boolean },
  ) => DuelRoomLifecycle;
  appendLogToState: (
    state: DuelState,
    message: string,
    level?: DuelLogLevel,
    actorSessionId?: string,
  ) => void;
  addLog: (
    message: string,
    level?: DuelLogLevel,
    actorSessionId?: string,
  ) => void;
  rebuildAllClientViews: () => void;
  syncPendingEffectDecision: () => void;
};

/**
 * Resolves consented leaves, temporary disconnections, and reconnection
 * outcomes for a duel room.
 */
export class DuelRoomLeaveHandler {
  public constructor(private readonly deps: DuelRoomLeaveHandlerDeps) {}

  /**
   * Applies the appropriate leave flow for one client.
   */
  public async handleLeave(
    client: Client,
    consented: boolean,
    reconnectionSeconds: number,
  ): Promise<void> {
    if (consented) {
      await this.handleConsentedLeave(client.sessionId);
      return;
    }

    await this.handleReconnectableLeave(client, reconnectionSeconds);
  }

  private async handleConsentedLeave(sessionId: string): Promise<void> {
    const state = cloneRoomDuelState(this.deps.state);
    const lifecycle = this.deps.createLifecycleForState(state, {
      isolated: true,
    });
    lifecycle.importState(this.deps.getLifecycle().exportState());
    const player = state.players.get(sessionId);

    if (!player) {
      return;
    }

    player.connected = false;
    this.deps.appendLogToState(
      state,
      `${player.displayName} est deconnecte.`,
      'system',
      player.sessionId,
    );
    lifecycle.declareForfeitIfMatchInProgress(player);

    adoptRoomDuelState(this.deps.state, state);
    const liveLifecycle = this.deps.getLifecycle();
    liveLifecycle.importState(lifecycle.exportState());
    liveLifecycle.recordMatchResult();
    liveLifecycle.removePlayer(sessionId);
    this.deps.rebuildAllClientViews();
    this.deps.syncPendingEffectDecision();
  }

  private async handleReconnectableLeave(
    client: Client,
    reconnectionSeconds: number,
  ): Promise<void> {
    const player = this.deps.state.players.get(client.sessionId);

    if (!player) {
      return;
    }

    player.connected = false;
    this.deps.addLog(
      `${player.displayName} est deconnecte.`,
      'system',
      player.sessionId,
    );

    try {
      await this.deps.allowReconnection(client, reconnectionSeconds);
      player.connected = true;
      this.deps.addLog(
        `${player.displayName} est reconnecte.`,
        'system',
        player.sessionId,
      );
      this.deps.syncPendingEffectDecision();
    } catch {
      this.deps.addLog(
        `${player.displayName} a perdu par forfait.`,
        'system',
        player.sessionId,
      );
      this.deps.getLifecycle().removePlayer(client.sessionId);
    }
  }
}
