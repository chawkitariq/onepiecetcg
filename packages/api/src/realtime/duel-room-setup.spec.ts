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
  life: 4,
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

type PrivateRoomAccess = {
  handleChooseFirstOrSecond: (
    client: { sessionId: string },
    message: { choice: 'first' | 'second' },
  ) => void;
  handleMulligan: (
    client: { sessionId: string },
    message: { mulligan: boolean },
  ) => void;
};

function asPrivateRoom(room: DuelRoom): PrivateRoomAccess {
  return room as unknown as PrivateRoomAccess;
}

async function createReadyRoom(): Promise<DuelRoom> {
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

describe('DuelRoom setup sequence (stage 6)', () => {
  it('lets the designated starting player choose to play first', async () => {
    const room = await createReadyRoom();
    const access = asPrivateRoom(room);
    const startingSessionId = room.state.startingPlayerSessionId;

    access.handleChooseFirstOrSecond(
      { sessionId: startingSessionId },
      { choice: 'first' },
    );

    expect(room.state.firstPlayerSessionId).toBe(startingSessionId);

    const disposableRoom = room as unknown as { _dispose: () => Promise<void> };
    await disposableRoom._dispose();
  });

  it('lets the designated starting player choose to play second', async () => {
    const room = await createReadyRoom();
    const access = asPrivateRoom(room);
    const startingSessionId = room.state.startingPlayerSessionId;
    const otherSessionId =
      startingSessionId === 'session-a' ? 'session-b' : 'session-a';

    access.handleChooseFirstOrSecond(
      { sessionId: startingSessionId },
      { choice: 'second' },
    );

    expect(room.state.firstPlayerSessionId).toBe(otherSessionId);

    const disposableRoom = room as unknown as { _dispose: () => Promise<void> };
    await disposableRoom._dispose();
  });

  it('ignores a first/second choice from a non-designated player', async () => {
    const room = await createReadyRoom();
    const access = asPrivateRoom(room);
    const startingSessionId = room.state.startingPlayerSessionId;
    const otherSessionId =
      startingSessionId === 'session-a' ? 'session-b' : 'session-a';

    access.handleChooseFirstOrSecond(
      { sessionId: otherSessionId },
      { choice: 'first' },
    );

    expect(room.state.firstPlayerSessionId).toBe('');

    const disposableRoom = room as unknown as { _dispose: () => Promise<void> };
    await disposableRoom._dispose();
  });

  it('ignores a second first/second choice once one has already been made', async () => {
    const room = await createReadyRoom();
    const access = asPrivateRoom(room);
    const startingSessionId = room.state.startingPlayerSessionId;

    access.handleChooseFirstOrSecond(
      { sessionId: startingSessionId },
      { choice: 'first' },
    );
    access.handleChooseFirstOrSecond(
      { sessionId: startingSessionId },
      { choice: 'second' },
    );

    expect(room.state.firstPlayerSessionId).toBe(startingSessionId);

    const disposableRoom = room as unknown as { _dispose: () => Promise<void> };
    await disposableRoom._dispose();
  });

  it('enforces the mulligan order, starting with the first player', async () => {
    const room = await createReadyRoom();
    const access = asPrivateRoom(room);
    const startingSessionId = room.state.startingPlayerSessionId;
    const secondSessionId =
      startingSessionId === 'session-a' ? 'session-b' : 'session-a';

    access.handleChooseFirstOrSecond(
      { sessionId: startingSessionId },
      { choice: 'first' },
    );

    access.handleMulligan({ sessionId: secondSessionId }, { mulligan: false });

    const secondPlayer = room.state.players.get(secondSessionId);
    expect(secondPlayer?.mulliganDecided).toBe(false);

    const disposableRoom = room as unknown as { _dispose: () => Promise<void> };
    await disposableRoom._dispose();
  });

  it('reshuffles and redraws exactly 5 cards on a mulligan', async () => {
    const room = await createReadyRoom();
    const access = asPrivateRoom(room);
    const firstSessionId = room.state.startingPlayerSessionId;

    access.handleChooseFirstOrSecond(
      { sessionId: firstSessionId },
      { choice: 'first' },
    );

    const player = room.state.players.get(firstSessionId);
    const originalHandIds = Array.from(player?.zones.hand ?? []).map(
      (card) => card.instanceId,
    );

    access.handleMulligan({ sessionId: firstSessionId }, { mulligan: true });

    expect(player?.zones.hand).toHaveLength(5);
    expect(player?.handCount).toBe(5);
    expect(player?.zones.deck).toHaveLength(45);
    expect(player?.mulliganDecided).toBe(true);

    const newHandIds = Array.from(player?.zones.hand ?? []).map(
      (card) => card.instanceId,
    );
    expect(newHandIds.sort()).not.toEqual(originalHandIds.sort());

    const disposableRoom = room as unknown as { _dispose: () => Promise<void> };
    await disposableRoom._dispose();
  });

  it('allows a single mulligan only, ignoring a second attempt', async () => {
    const room = await createReadyRoom();
    const access = asPrivateRoom(room);
    const firstSessionId = room.state.startingPlayerSessionId;

    access.handleChooseFirstOrSecond(
      { sessionId: firstSessionId },
      { choice: 'first' },
    );

    access.handleMulligan({ sessionId: firstSessionId }, { mulligan: true });
    const player = room.state.players.get(firstSessionId);
    const handAfterFirstMulligan = Array.from(player?.zones.hand ?? []).map(
      (card) => card.instanceId,
    );

    access.handleMulligan({ sessionId: firstSessionId }, { mulligan: true });
    const handAfterSecondAttempt = Array.from(player?.zones.hand ?? []).map(
      (card) => card.instanceId,
    );

    expect(handAfterSecondAttempt).toEqual(handAfterFirstMulligan);

    const disposableRoom = room as unknown as { _dispose: () => Promise<void> };
    await disposableRoom._dispose();
  });

  it('deals life piles sized by Leader life and starts turn 1 for the first player once both mulligans are resolved', async () => {
    const room = await createReadyRoom();
    const access = asPrivateRoom(room);
    const firstSessionId = room.state.startingPlayerSessionId;
    const secondSessionId =
      firstSessionId === 'session-a' ? 'session-b' : 'session-a';

    access.handleChooseFirstOrSecond(
      { sessionId: firstSessionId },
      { choice: 'first' },
    );
    access.handleMulligan({ sessionId: firstSessionId }, { mulligan: false });

    expect(room.state.phase).toBe('mulligan');
    expect(room.state.turn).toBe(0);

    access.handleMulligan({ sessionId: secondSessionId }, { mulligan: true });

    const firstPlayer = room.state.players.get(firstSessionId);
    const secondPlayer = room.state.players.get(secondSessionId);

    expect(firstPlayer?.zones.life).toHaveLength(4);
    expect(firstPlayer?.lifeCount).toBe(4);
    expect(secondPlayer?.zones.life).toHaveLength(4);
    expect(secondPlayer?.lifeCount).toBe(4);
    expect(
      Array.from(firstPlayer?.zones.life ?? []).every((card) => card.faceDown),
    ).toBe(true);

    expect(room.state.phase).toBe('refresh');
    expect(room.state.turn).toBe(1);
    expect(room.state.activePlayerSessionId).toBe(firstSessionId);
    // "commence le premier tour" is logged when turn 1 starts, immediately
    // followed by the auto-run Refresh Phase's own log entry -- so it's not
    // necessarily the last log, just present in the setup log history.
    expect(
      Array.from(room.state.logs).some((log) =>
        log.message.includes('commence le premier tour'),
      ),
    ).toBe(true);

    const disposableRoom = room as unknown as { _dispose: () => Promise<void> };
    await disposableRoom._dispose();
  });

  it('does not let a first/second choice reassign the first player once the opponent has left', async () => {
    const room = await createReadyRoom();
    const access = asPrivateRoom(room);
    const startingSessionId = room.state.startingPlayerSessionId;
    const otherSessionId =
      startingSessionId === 'session-a' ? 'session-b' : 'session-a';

    await room.onLeave({ sessionId: otherSessionId } as never, true);

    access.handleChooseFirstOrSecond(
      { sessionId: startingSessionId },
      { choice: 'second' },
    );

    expect(room.state.firstPlayerSessionId).toBe('');
  });

  it('does not start the first turn once a player has left mid-mulligan', async () => {
    const room = await createReadyRoom();
    const access = asPrivateRoom(room);
    const startingSessionId = room.state.startingPlayerSessionId;
    const otherSessionId =
      startingSessionId === 'session-a' ? 'session-b' : 'session-a';

    access.handleChooseFirstOrSecond(
      { sessionId: startingSessionId },
      { choice: 'first' },
    );

    await room.onLeave({ sessionId: otherSessionId } as never, true);

    access.handleMulligan(
      { sessionId: startingSessionId },
      { mulligan: false },
    );

    expect(room.state.phase).toBe('mulligan');
    expect(room.state.turn).toBe(0);
    expect(room.state.players.get(startingSessionId)?.zones.life).toHaveLength(
      0,
    );
  });
});
