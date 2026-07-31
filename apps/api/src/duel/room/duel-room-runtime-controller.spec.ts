import { DuelState } from '@onepiecetcg/shared';
import { DuelRoomRuntimeController } from './duel-room-runtime-controller';

describe('DuelRoomRuntimeController', () => {
  it('returns the installed live runtime when no interaction is pending', () => {
    const liveState = new DuelState();
    let pendingRuntime: any = null;
    const controller = new DuelRoomRuntimeController({
      liveState,
      getPendingRuntime: () => pendingRuntime,
    });
    const liveRuntime = {
      effectBoundary: {
        hasPendingPlayerInteraction: () => false,
      },
      combatEngine: { id: 'live-combat' },
      runtimeState: { id: 'live-runtime-state' },
    };

    controller.installGameplayRuntime(liveRuntime as never);

    expect(controller.getGameplayRuntime()).toBe(liveRuntime);
    expect(controller.getRuntimeState()).toBe(liveRuntime.runtimeState);
    expect(controller.getActiveEffectBoundary()).toBe(liveRuntime.effectBoundary);
    expect(controller.hasPendingPlayerInteraction()).toBe(false);
    expect(controller.getActiveRuntimeContext()).toEqual({
      state: liveState,
      runtimeState: liveRuntime.runtimeState,
      effectBoundary: liveRuntime.effectBoundary,
      combatEngine: liveRuntime.combatEngine,
    });
  });

  it('switches active interaction accessors to the pending runtime when present', () => {
    const liveState = new DuelState();
    const pendingState = new DuelState();
    const liveRuntime = {
      effectBoundary: {
        hasPendingPlayerInteraction: () => false,
      },
      combatEngine: { id: 'live-combat' },
      runtimeState: { id: 'live-runtime-state' },
    };
    const pendingRuntime = {
      state: pendingState,
      runtimeState: { id: 'pending-runtime-state' },
      gameplayRuntime: {
        effectBoundary: {
          hasPendingPlayerInteraction: () => true,
        },
        combatEngine: { id: 'pending-combat' },
      },
    };
    const controller = new DuelRoomRuntimeController({
      liveState,
      getPendingRuntime: () => pendingRuntime as never,
    });

    controller.installGameplayRuntime(liveRuntime as never);

    expect(controller.getActiveEffectBoundary()).toBe(
      pendingRuntime.gameplayRuntime.effectBoundary,
    );
    expect(controller.hasPendingPlayerInteraction()).toBe(true);
    expect(controller.getActiveRuntimeContext()).toEqual({
      state: pendingState,
      runtimeState: pendingRuntime.runtimeState,
      effectBoundary: pendingRuntime.gameplayRuntime.effectBoundary,
      combatEngine: pendingRuntime.gameplayRuntime.combatEngine,
    });
  });
});
