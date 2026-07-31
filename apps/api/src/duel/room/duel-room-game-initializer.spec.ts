import { DuelState } from '@onepiecetcg/shared';
import { DuelRoomGameInitializer } from './duel-room-game-initializer';

describe('duel-room-game-initializer', () => {
  it('initializes, persists, adopts, then locks the room', async () => {
    const runtime = { state: new DuelState() };
    const order: string[] = [];
    const initializer = new DuelRoomGameInitializer({
      state: new DuelState(),
      createRuntime: () => {
        order.push('create');
        return runtime;
      },
      initializeRuntimeGame: (nextRuntime) => {
        expect(nextRuntime).toBe(runtime);
        order.push('initialize');
      },
      ensureEventStreamInitialized: async (state) => {
        expect(state).toBe(runtime.state);
        order.push('persist');
      },
      adoptRuntime: (nextRuntime) => {
        expect(nextRuntime).toBe(runtime);
        order.push('adopt');
      },
      lockRoom: () => {
        order.push('lock');
      },
    });

    await initializer.initialize();

    expect(order).toEqual([
      'create',
      'initialize',
      'persist',
      'adopt',
      'lock',
    ]);
  });
});
