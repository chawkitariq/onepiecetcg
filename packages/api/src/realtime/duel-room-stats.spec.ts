import type { Card } from '@onepiecetcg/shared';
import { DuelRoom, configureDuelRoomServices } from './duel.room';

jest.mock('@onepiecetcg/shared', () => {
  const sharedMock: typeof import('../decks/shared-test.mock') =
    jest.requireActual('../decks/shared-test.mock');

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
  life: 2,
  counter: null,
  attributes: [],
  families: [],
  text: '',
  trigger: null,
  imageUrl: null,
  set: { id: 'TEST', name: 'Test' },
  rarity: null,
};

const weakCharacter: Card = {
  ...leader,
  id: 'C-001',
  number: 'C-001',
  name: 'Weak Character',
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
  handleEndPhase: (client: { sessionId: string; send: jest.Mock }) => void;
  handleDeclareAttack: (
    client: { sessionId: string; send: jest.Mock },
    message: {
      attackerInstanceId: string;
      targetType: 'leader' | 'character';
      targetInstanceId?: string;
    },
  ) => void;
  handleDeclareBlock: (
    client: { sessionId: string; send: jest.Mock },
    message: { blockerInstanceId?: string | null },
  ) => void;
  handleFinishCounterStep: (client: {
    sessionId: string;
    send: jest.Mock;
  }) => void;
};

function asPrivateRoom(room: DuelRoom): PrivateRoomAccess {
  return room as unknown as PrivateRoomAccess;
}

function fakeClient(sessionId: string) {
  return { sessionId, send: jest.fn() };
}

async function createRoomAtFirstTurn(statsService?: {
  recordMatchResult: jest.Mock;
}): Promise<{
  room: DuelRoom;
  firstSessionId: string;
  secondSessionId: string;
}> {
  configureDuelRoomServices({
    decksService: {
      getValidatedGameDeck: jest.fn((authUserId: string, deckId: string) =>
        Promise.resolve({
          id: deckId,
          name: 'Valid deck',
          ownerAuthUserId: authUserId,
          leader,
          cards: Array.from({ length: 50 }, (_, index) => ({
            ...weakCharacter,
            copyIndex: index + 1,
          })),
        }),
      ),
    } as never,
    statsService: statsService as never,
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

  const access = asPrivateRoom(room);
  const firstSessionId = room.state.startingPlayerSessionId;
  const secondSessionId =
    firstSessionId === 'session-a' ? 'session-b' : 'session-a';

  access.handleChooseFirstOrSecond(
    { sessionId: firstSessionId },
    { choice: 'first' },
  );
  access.handleMulligan({ sessionId: firstSessionId }, { mulligan: false });
  access.handleMulligan({ sessionId: secondSessionId }, { mulligan: false });

  return { room, firstSessionId, secondSessionId };
}

function advanceToMain(room: DuelRoom, sessionId: string): void {
  const access = asPrivateRoom(room);
  const client = fakeClient(sessionId);

  access.handleEndPhase(client); // draw
  access.handleEndPhase(client); // don
  access.handleEndPhase(client); // main
}

function advanceToSecondMainTurn(
  room: DuelRoom,
  firstSessionId: string,
  secondSessionId: string,
): void {
  advanceToMain(room, firstSessionId);
  const access = asPrivateRoom(room);
  access.handleEndPhase(fakeClient(firstSessionId));
  access.handleEndPhase(fakeClient(firstSessionId));
  advanceToMain(room, secondSessionId);
  access.handleEndPhase(fakeClient(secondSessionId));
  access.handleEndPhase(fakeClient(secondSessionId));
  advanceToMain(room, firstSessionId);
}

async function disposeRoom(room: DuelRoom): Promise<void> {
  const disposableRoom = room as unknown as { _dispose: () => Promise<void> };
  await disposableRoom._dispose();
}

describe('DuelRoom match result recording (stage 13)', () => {
  it('sets winnerSessionId and endReason and records a match result on life-to-zero defeat', async () => {
    const recordMatchResult = jest.fn().mockResolvedValue(undefined);
    const { room, firstSessionId, secondSessionId } =
      await createRoomAtFirstTurn({ recordMatchResult });
    advanceToSecondMainTurn(room, firstSessionId, secondSessionId);

    const access = asPrivateRoom(room);
    const attacker = room.state.players.get(firstSessionId);
    const defender = room.state.players.get(secondSessionId);
    defender!.zones.life.splice(0);
    defender!.lifeCount = 0;

    access.handleDeclareAttack(fakeClient(firstSessionId), {
      attackerInstanceId: attacker!.zones.leader.instanceId,
      targetType: 'leader',
    });
    access.handleDeclareBlock(fakeClient(secondSessionId), {
      blockerInstanceId: null,
    });
    access.handleFinishCounterStep(fakeClient(secondSessionId));

    expect(room.state.phase).toBe('finished');
    expect(room.state.endReason).toBe('life');
    expect(room.state.winnerSessionId).toBe(firstSessionId);

    // recordMatchResult is fire-and-forget (void promise) inside the room --
    // flush microtasks so the mock's assertions observe the resolved call.
    await Promise.resolve();
    await Promise.resolve();

    expect(recordMatchResult).toHaveBeenCalledTimes(1);
    const [input] = recordMatchResult.mock.calls[0] as [
      {
        winnerAuthUserId: string;
        loserAuthUserId: string;
        winnerDeckId: string | null;
        loserDeckId: string | null;
        winnerLeaderCardId: string;
        loserLeaderCardId: string;
        winnerWentFirst: boolean;
        endReason: string;
      },
    ];
    expect(input.winnerAuthUserId).toBe(
      firstSessionId === 'session-a' ? 'user-a' : 'user-b',
    );
    expect(input.loserAuthUserId).toBe(
      secondSessionId === 'session-a' ? 'user-a' : 'user-b',
    );
    expect(input.winnerLeaderCardId).toBe('L-001');
    expect(input.loserLeaderCardId).toBe('L-001');
    expect(input.winnerWentFirst).toBe(true);
    expect(input.endReason).toBe('life');

    await disposeRoom(room);
  });

  it('does not record a match result more than once for the same game-end', async () => {
    const recordMatchResult = jest.fn().mockResolvedValue(undefined);
    const { room, firstSessionId, secondSessionId } =
      await createRoomAtFirstTurn({ recordMatchResult });
    advanceToSecondMainTurn(room, firstSessionId, secondSessionId);

    const access = asPrivateRoom(room);
    const attacker = room.state.players.get(firstSessionId);
    const defender = room.state.players.get(secondSessionId);
    defender!.zones.life.splice(0);
    defender!.lifeCount = 0;

    access.handleDeclareAttack(fakeClient(firstSessionId), {
      attackerInstanceId: attacker!.zones.leader.instanceId,
      targetType: 'leader',
    });
    access.handleDeclareBlock(fakeClient(secondSessionId), {
      blockerInstanceId: null,
    });
    access.handleFinishCounterStep(fakeClient(secondSessionId));

    await Promise.resolve();
    await Promise.resolve();

    expect(recordMatchResult).toHaveBeenCalledTimes(1);

    await disposeRoom(room);
  });

  it('never records a match result when a player forfeits by disconnection', async () => {
    const recordMatchResult = jest.fn().mockResolvedValue(undefined);
    const { room, firstSessionId, secondSessionId } =
      await createRoomAtFirstTurn({ recordMatchResult });
    advanceToSecondMainTurn(room, firstSessionId, secondSessionId);

    jest
      .spyOn(room, 'allowReconnection')
      .mockRejectedValue(new Error('timed out'));

    await room.onLeave(fakeClient(secondSessionId) as never, false);

    expect(room.state.phase).not.toBe('finished');
    expect(room.state.winnerSessionId).toBe('');
    expect(room.state.endReason).toBe('');
    expect(recordMatchResult).not.toHaveBeenCalled();

    await disposeRoom(room);
  });

  it('declares the remaining player the winner and records a forfeit when a player explicitly leaves mid-match (e.g. "Retourner au lobby")', async () => {
    const recordMatchResult = jest.fn().mockResolvedValue(undefined);
    const { room, firstSessionId, secondSessionId } =
      await createRoomAtFirstTurn({ recordMatchResult });
    advanceToSecondMainTurn(room, firstSessionId, secondSessionId);

    await room.onLeave(fakeClient(firstSessionId) as never, true);

    expect(room.state.phase).toBe('finished');
    expect(room.state.endReason).toBe('forfeit');
    expect(room.state.winnerSessionId).toBe(secondSessionId);

    await Promise.resolve();
    await Promise.resolve();

    expect(recordMatchResult).toHaveBeenCalledTimes(1);
    const [input] = recordMatchResult.mock.calls[0] as [
      { winnerAuthUserId: string; loserAuthUserId: string; endReason: string },
    ];
    expect(input.winnerAuthUserId).toBe(
      secondSessionId === 'session-a' ? 'user-a' : 'user-b',
    );
    expect(input.loserAuthUserId).toBe(
      firstSessionId === 'session-a' ? 'user-a' : 'user-b',
    );
    expect(input.endReason).toBe('forfeit');

    await disposeRoom(room);
  });

  it('does not record a forfeit for a consented leave before the match has started (setup/mulligan)', async () => {
    const recordMatchResult = jest.fn().mockResolvedValue(undefined);
    configureDuelRoomServices({
      decksService: {
        getValidatedGameDeck: jest.fn((authUserId: string, deckId: string) =>
          Promise.resolve({
            id: deckId,
            name: 'Valid deck',
            ownerAuthUserId: authUserId,
            leader,
            cards: Array.from({ length: 50 }, (_, index) => ({
              ...weakCharacter,
              copyIndex: index + 1,
            })),
          }),
        ),
      } as never,
      statsService: { recordMatchResult } as never,
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

    expect(room.state.phase).toBe('mulligan');

    await room.onLeave(fakeClient('session-a') as never, true);

    expect(room.state.phase).not.toBe('finished');
    expect(room.state.winnerSessionId).toBe('');
    expect(room.state.endReason).toBe('');
    expect(recordMatchResult).not.toHaveBeenCalled();

    await disposeRoom(room);
  });

  it('does not record a forfeit for a consented leave once the match is already finished', async () => {
    const recordMatchResult = jest.fn().mockResolvedValue(undefined);
    const { room, firstSessionId, secondSessionId } =
      await createRoomAtFirstTurn({ recordMatchResult });
    advanceToSecondMainTurn(room, firstSessionId, secondSessionId);

    const access = asPrivateRoom(room);
    const attacker = room.state.players.get(firstSessionId);
    const defender = room.state.players.get(secondSessionId);
    defender!.zones.life.splice(0);
    defender!.lifeCount = 0;

    access.handleDeclareAttack(fakeClient(firstSessionId), {
      attackerInstanceId: attacker!.zones.leader.instanceId,
      targetType: 'leader',
    });
    access.handleDeclareBlock(fakeClient(secondSessionId), {
      blockerInstanceId: null,
    });
    access.handleFinishCounterStep(fakeClient(secondSessionId));

    await Promise.resolve();
    await Promise.resolve();
    recordMatchResult.mockClear();

    // The loser leaving the room after the game already ended must not
    // overwrite the already-recorded result with a second "forfeit" one.
    await room.onLeave(fakeClient(secondSessionId) as never, true);

    expect(room.state.endReason).toBe('life');
    expect(room.state.winnerSessionId).toBe(firstSessionId);
    expect(recordMatchResult).not.toHaveBeenCalled();

    await disposeRoom(room);
  });
});
