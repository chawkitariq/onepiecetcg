import type { DuelCard, DuelPlayer, DuelState } from '@onepiecetcg/shared';
import {
  DuelRoomRuntimeState,
  captureDuelRoomCardKeywordSnapshot,
  restoreDuelRoomCardKeywordSnapshot,
  type DuelRoomCardKeywordSnapshot,
} from '@onepiecetcg/duel-engine';
import type { Client } from 'colyseus';
import type { DuelRoomGameplayRuntime } from './duel-room-gameplay-runtime';
import { DuelRoomClientNotifier } from './duel-room-client-notifier';
import type { DuelRoomLifecycle } from './duel-room-lifecycle';
import { createDuelRoomLifecycle } from './duel-room-lifecycle-factory';
import { DuelRoomInteractionRuntimeCoordinator } from './duel-room-interaction-runtime';
import type { DuelRoomPendingInteractionRuntime } from './duel-room-interaction-runtime';
import type { DuelRoomIsolatedGameplayRuntime } from './duel-room-isolated-gameplay-runtime';
import { DuelRoomIsolatedCommandRunner } from './duel-room-isolated-command-runner';
import { DuelRoomSeatBootstrap } from './duel-room-seat-bootstrap';

/**
 * Concrete services instantiated when a duel room boots.
 */
export type DuelRoomRuntimeBootstrap = {
  lifecycle: DuelRoomLifecycle;
  runtimeState: DuelRoomRuntimeState;
  notifier: DuelRoomClientNotifier;
  isolatedCommandRunner: DuelRoomIsolatedCommandRunner;
  interactionRuntimeCoordinator: DuelRoomInteractionRuntimeCoordinator;
  seatBootstrap: DuelRoomSeatBootstrap;
};

/**
 * Dependencies needed to bootstrap room-scoped runtime services.
 */
export type CreateDuelRoomRuntimeBootstrapInput = {
  state: DuelState;
  getClients: () => readonly Client[];
  broadcast: (type: string, message: object) => void;
  getPendingRuntime: () => DuelRoomPendingInteractionRuntime | null;
  setPendingRuntime: (
    runtime: DuelRoomPendingInteractionRuntime | null,
  ) => void;
  getActiveEffectDecision: () => ReturnType<
    DuelRoomGameplayRuntime['effectBoundary']['getPendingEffectDecision']
  >;
  createLifecycleForState: (
    state: DuelState,
    options?: { isolated?: boolean },
  ) => DuelRoomLifecycle;
  createLiveGameplayRuntime: (state: DuelState) => DuelRoomGameplayRuntime;
  createIsolatedGameplayRuntime: () => DuelRoomIsolatedGameplayRuntime;
  installLifecycle: (lifecycle: DuelRoomLifecycle) => void;
  installGameplayRuntime: (runtime: DuelRoomGameplayRuntime) => void;
  adoptRuntime: (runtime: DuelRoomIsolatedGameplayRuntime) => void;
  hasPendingPlayerInteraction: () => boolean;
  rebuildAllClientViews: () => void;
  syncZoneCounts: (player: DuelPlayer) => void;
  broadcastCardView: (card: DuelCard) => void;
  sendActionError: (client: Pick<Client, 'send'>, message: string) => void;
  logSystemMessage: (message: string, actorSessionId?: string) => void;
  disconnectRoom: () => Promise<void> | void;
};

/**
 * Creates the orchestration helpers required by a live duel room.
 */
export function createDuelRoomRuntimeBootstrap(
  input: CreateDuelRoomRuntimeBootstrapInput,
): DuelRoomRuntimeBootstrap {
  const lifecycle = createDuelRoomLifecycle({
    state: input.state,
    addLog: (message, actorSessionId) =>
      input.logSystemMessage(message, actorSessionId),
    disconnectRoom: () => input.disconnectRoom(),
  });
  const runtimeState = new DuelRoomRuntimeState({ state: input.state });
  const notifier = new DuelRoomClientNotifier({
    getClients: () => input.getClients(),
    broadcast: (type, message) => input.broadcast(type, message),
    getPendingEffectDecision: () => input.getActiveEffectDecision(),
  });
  const isolatedCommandRunner = new DuelRoomIsolatedCommandRunner({
    createRuntime: () => input.createIsolatedGameplayRuntime(),
    adoptRuntime: (runtime) => input.adoptRuntime(runtime),
    hasPendingPlayerInteraction: () => input.hasPendingPlayerInteraction(),
    sendActionError: (client, message) =>
      input.sendActionError(client, message),
  });
  const interactionRuntimeCoordinator =
    new DuelRoomInteractionRuntimeCoordinator({
      liveState: input.state,
      getPendingRuntime: () => input.getPendingRuntime(),
      setPendingRuntime: (runtime) => input.setPendingRuntime(runtime),
      createLifecycleForState: (state) => input.createLifecycleForState(state),
      installLifecycle: (nextLifecycle) =>
        input.installLifecycle(nextLifecycle),
      createLiveGameplayRuntime: (state) =>
        input.createLiveGameplayRuntime(state),
      installGameplayRuntime: (runtime) =>
        input.installGameplayRuntime(runtime),
      rebuildAllClientViews: () => input.rebuildAllClientViews(),
      syncPendingEffectDecision: (decision) =>
        notifier.syncPendingEffectDecision(decision),
      captureCardKeywordSnapshot: (state) =>
        captureDuelRoomCardKeywordSnapshot(state),
      restoreCardKeywordSnapshot: (state, snapshot) =>
        restoreDuelRoomCardKeywordSnapshot(
          state,
          snapshot as Map<string, DuelRoomCardKeywordSnapshot>,
        ),
    });
  const seatBootstrap = new DuelRoomSeatBootstrap({
    syncZoneCounts: (player) => input.syncZoneCounts(player),
    broadcastCardView: (card) => input.broadcastCardView(card),
  });

  return {
    lifecycle,
    runtimeState,
    notifier,
    isolatedCommandRunner,
    interactionRuntimeCoordinator,
    seatBootstrap,
  };
}
