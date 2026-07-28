import type { DuelCard } from '@onepiecetcg/shared';
import type { PendingEffectDecision } from '@onepiecetcg/shared';
import type { Client } from 'colyseus';

type EffectDecisionWaitingMessage = {
  playerSessionId: string;
};

type ClientSender = Pick<Client, 'send'>;

/**
 * Dependencies required to synchronize out-of-band client notifications for a
 * duel room without coupling that protocol directly to `DuelRoom`.
 */
export type DuelRoomClientNotifierDeps = {
  getClients: () => readonly Client[];
  broadcast: (type: string, message: object) => void;
  getPendingEffectDecision: () => PendingEffectDecision | null;
};

/**
 * Owns the client-facing notification protocol around public card visibility,
 * action errors, and pending effect-decision synchronization.
 */
export class DuelRoomClientNotifier {
  private currentMainPhaseClient: ClientSender | null = null;

  private currentCombatClient: ClientSender | null = null;

  public constructor(private readonly deps: DuelRoomClientNotifierDeps) {}

  /**
   * Makes a public card instance visible to every currently connected client.
   */
  public broadcastCardView(card: DuelCard): void {
    for (const client of this.deps.getClients()) {
      client.view?.add(card);
    }
  }

  /**
   * Sends a normalized action error to the provided client.
   */
  public sendActionError(client: ClientSender, message: string): void {
    client.send('actionError', { message });
  }

  /**
   * Sends an action error to the currently-bound main-phase requester.
   */
  public sendMainPhaseError(message: string): void {
    if (this.currentMainPhaseClient) {
      this.sendActionError(this.currentMainPhaseClient, message);
    }
  }

  /**
   * Sends an action error to the currently-bound combat requester.
   */
  public sendCombatError(message: string): void {
    if (this.currentCombatClient) {
      this.sendActionError(this.currentCombatClient, message);
    }
  }

  /**
   * Binds the client that initiated the current main-phase action.
   */
  public bindMainPhaseClient(client: ClientSender): void {
    this.currentMainPhaseClient = client;
  }

  /**
   * Binds the client that initiated the current combat action.
   */
  public bindCombatClient(client: ClientSender): void {
    this.currentCombatClient = client;
  }

  /**
   * Syncs pending effect-decision state for every connected client.
   */
  public syncPendingEffectDecision(
    decision: PendingEffectDecision | null,
  ): void {
    for (const client of this.deps.getClients()) {
      client.send('clearPendingEffectDecision', {});
    }

    if (!decision) {
      this.deps.broadcast('clearEffectDecisionWaiting', {});
      return;
    }

    const chooserClient = this.deps
      .getClients()
      .find((client) => client.sessionId === decision.playerSessionId);
    chooserClient?.send('pendingEffectDecision', decision);
    this.deps.broadcast('effectDecisionWaiting', {
      playerSessionId: decision.playerSessionId,
    } satisfies EffectDecisionWaitingMessage);
  }

  /**
   * Replays the current pending effect-decision state to one connected client.
   */
  public sendPendingEffectDecisionToClient(client: ClientSender): void {
    if (typeof client.send !== 'function') {
      return;
    }

    const decision = this.deps.getPendingEffectDecision();

    if (!decision) {
      client.send('clearPendingEffectDecision', {});
      client.send('clearEffectDecisionWaiting', {});
      return;
    }

    client.send('effectDecisionWaiting', {
      playerSessionId: decision.playerSessionId,
    } satisfies EffectDecisionWaitingMessage);

    if ((client as Client).sessionId === decision.playerSessionId) {
      client.send('pendingEffectDecision', decision);
      return;
    }

    client.send('clearPendingEffectDecision', {});
  }
}
