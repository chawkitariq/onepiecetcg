import type { Card } from '@onepiecetcg/shared';
import { DuelRoom, configureDuelRoomServices } from './duel.room';

jest.mock('@onepiecetcg/shared', () => {
  const sharedMock: typeof import('../deck/shared-test.mock') =
    jest.requireActual('../deck/shared-test.mock');

  return sharedMock;
});

const leader: Card = {
  id: 'L-001',
  number: 'L-001',
  name: 'Leader',
  type: 'Leader',
  colors: ['Red'],
  cost: null,
  power: 5000,
  life: 5,
  counter: null,
  attributes: [],
  families: [],
  text: '',
  trigger: null,
  imageUrl: null,
  set: { id: 'TEST', name: 'Test' },
  rarity: null,
};

const mainCard: Card = {
  ...leader,
  id: 'C-001',
  number: 'C-001',
  name: 'Character',
  type: 'Character',
  cost: 1,
  power: 1000,
  life: null,
  counter: 1000,
};

/** Minimal fake client shape `allowReconnection`/`onLeave` need. */
function fakeClient(sessionId: string) {
  return {
    sessionId,
    _enqueuedMessages: undefined,
    reconnectionToken: `token-${sessionId}`,
    auth: undefined,
    ref: {},
  };
}

async function joinTwoPlayers(): Promise<DuelRoom> {
  configureDuelRoomServices({
    decksService: {
      getValidatedGameDeck: jest.fn((authUserId: string, deckId: string) =>
        Promise.resolve({
          id: deckId,
          name: 'Valid deck',
          ownerAuthUserId: authUserId,
          leader,
          cards: Array.from({ length: 50 }, (_, index) => ({
            ...mainCard,
            copyIndex: index + 1,
          })),
        }),
      ),
    } as never,
  });

  const room = new DuelRoom();
  (
    room as DuelRoom & { listing: { remove: jest.Mock; metadata: object } }
  ).listing = {
    remove: jest.fn(),
    metadata: {},
  };
  room.onCreate();
  jest.spyOn(room, 'lock').mockImplementation(() => undefined);

  await room.onJoin(
    { sessionId: 'session-a' } as never,
    { displayName: 'Alice', deckId: 'deck-a' },
    { userId: 'user-a' },
  );
  await room.onJoin(
    { sessionId: 'session-b' } as never,
    { displayName: 'Bob', deckId: 'deck-b' },
    { userId: 'user-b' },
  );

  return room;
}

async function disposeRoom(room: DuelRoom): Promise<void> {
  const disposableRoom = room as unknown as { _dispose: () => Promise<void> };
  await disposableRoom._dispose();
}

describe('DuelRoom reconnection', () => {
  it('marks a player disconnected and removes them immediately on a consented leave', async () => {
    const room = await joinTwoPlayers();

    await room.onLeave(fakeClient('session-a') as never, true);

    expect(room.state.players.get('session-a')).toBeUndefined();
    expect(room.state.logs.at(-1)?.message).toContain('deconnecte');
    expect(room.state.logs.at(-1)?.level).toBe('system');
    expect(room.state.logs.at(-1)?.actorSessionId).toBe('session-a');

    await disposeRoom(room);
  });

  it('marks connected=false immediately on an unconsented leave, before the reconnection window resolves', async () => {
    const room = await joinTwoPlayers();

    // Deliberately not awaited: onLeave's reconnection branch only settles
    // once allowReconnection's deferred resolves or times out, but the
    // `connected = false` + log side effects happen synchronously first.
    const leavePromise = room.onLeave(fakeClient('session-a') as never, false);
    leavePromise.catch(() => undefined);

    expect(room.state.players.get('session-a')?.connected).toBe(false);
    expect(room.state.logs.at(-1)?.message).toContain('deconnecte');
    expect(room.state.logs.at(-1)?.level).toBe('system');
    expect(room.state.logs.at(-1)?.actorSessionId).toBe('session-a');
    // The player entry itself must survive the initial disconnect -- only a
    // consented leave (or an expired reconnection window) removes it.
    expect(room.state.players.has('session-a')).toBe(true);

    await disposeRoom(room);
  });

  it('restores connected=true and preserves zone state when the same client reconnects in time', async () => {
    const room = await joinTwoPlayers();
    const aliceBeforeDisconnect = room.state.players.get('session-a');
    const handBefore = aliceBeforeDisconnect?.zones.hand.map(
      (card) => card.instanceId,
    );

    const client = fakeClient('session-a');
    const leavePromise = room.onLeave(client as never, false);

    expect(room.state.players.get('session-a')?.connected).toBe(false);

    const roomInternals = room as unknown as {
      _reconnections: Record<
        string,
        [string, { resolve: (value: unknown) => void }]
      >;
    };
    const [, deferred] = roomInternals._reconnections[client.reconnectionToken];
    deferred.resolve(client);

    await leavePromise;

    const aliceAfterReconnect = room.state.players.get('session-a');
    expect(aliceAfterReconnect?.connected).toBe(true);
    expect(aliceAfterReconnect).toBe(aliceBeforeDisconnect);
    expect(
      aliceAfterReconnect?.zones.hand.map((card) => card.instanceId),
    ).toEqual(handBefore);
    expect(room.state.logs.at(-1)?.message).toContain('reconnecte');
    expect(room.state.logs.at(-1)?.level).toBe('system');
    expect(room.state.logs.at(-1)?.actorSessionId).toBe('session-a');

    await disposeRoom(room);
  });

  it('removes the player and logs a forfeit once the reconnection window expires', async () => {
    const room = await joinTwoPlayers();

    const client = fakeClient('session-a');
    const leavePromise = room.onLeave(client as never, false);

    const roomInternals = room as unknown as {
      _reconnections: Record<
        string,
        [string, { reject: (value: unknown) => void }]
      >;
    };
    const [, deferred] = roomInternals._reconnections[client.reconnectionToken];
    deferred.reject(false);

    await leavePromise;

    expect(room.state.players.get('session-a')).toBeUndefined();
    expect(room.state.logs.at(-1)?.message).toContain('forfait');
    expect(room.state.logs.at(-1)?.level).toBe('system');
    expect(room.state.logs.at(-1)?.actorSessionId).toBe('session-a');

    await disposeRoom(room);
  });
});
