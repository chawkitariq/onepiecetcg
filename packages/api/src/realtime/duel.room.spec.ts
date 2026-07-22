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

describe('DuelRoom', () => {
  it('loads two valid decks and initializes hidden and public zones', async () => {
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

    const alice = room.state.players.get('session-a');
    const bob = room.state.players.get('session-b');

    expect(room.state.players.size).toBe(2);
    expect(alice?.ready).toBe(true);
    expect(bob?.ready).toBe(true);
    expect(alice?.zones.leader.name).toBe('Leader');
    expect(alice?.zones.hand).toHaveLength(5);
    expect(alice?.zones.life).toHaveLength(5);
    expect(alice?.zones.deck).toHaveLength(40);
    expect(alice?.zones.donDeck).toHaveLength(10);
    expect(Array.from(alice?.zones.hand ?? [])[0]?.privateToOwner).toBe(true);
    expect(Array.from(alice?.zones.life ?? [])[0]?.privateToOwner).toBe(true);
    expect(alice?.zones.leader.privateToOwner).toBe(false);
    expect(alice?.handCount).toBe(5);
    expect(alice?.lifeCount).toBe(5);
    expect(alice?.deckCount).toBe(40);
    expect(room.state.logs.at(-1)?.message).toContain('zones initiales');

    const disposableRoom = room as unknown as { _dispose: () => Promise<void> };
    await disposableRoom._dispose();
  });

  it('rejects a join without a resolved session', async () => {
    configureDuelRoomServices({
      decksService: { getValidatedGameDeck: jest.fn() } as never,
    });

    const room = new DuelRoom();
    room.onCreate();

    await expect(
      room.onJoin(
        { sessionId: 'session-a' } as never,
        { displayName: 'Alice', deckId: 'deck-a' },
        undefined,
      ),
    ).rejects.toThrow('Utilisateur et deck requis');
  });

  it('rejects a join without a deckId', async () => {
    configureDuelRoomServices({
      decksService: { getValidatedGameDeck: jest.fn() } as never,
    });

    const room = new DuelRoom();
    room.onCreate();

    await expect(
      room.onJoin(
        { sessionId: 'session-a' } as never,
        { displayName: 'Alice' },
        { userId: 'user-a' },
      ),
    ).rejects.toThrow('Utilisateur et deck requis');
  });

  it('rejects a duplicate join from the same authenticated user', async () => {
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
    room.onCreate();
    jest.spyOn(room, 'lock').mockImplementation(() => undefined);

    await room.onJoin(
      { sessionId: 'session-a' } as never,
      { displayName: 'Alice', deckId: 'deck-a' },
      { userId: 'user-a' },
    );

    await expect(
      room.onJoin(
        { sessionId: 'session-c' } as never,
        { displayName: 'Alice again', deckId: 'deck-a' },
        { userId: 'user-a' },
      ),
    ).rejects.toThrow('Ce joueur est deja dans la room');
  });

  it('rejects a join once the room is full', async () => {
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

    await expect(
      room.onJoin(
        { sessionId: 'session-c' } as never,
        { displayName: 'Carl', deckId: 'deck-c' },
        { userId: 'user-c' },
      ),
    ).rejects.toThrow('La room est deja complete');

    const disposableRoom = room as unknown as { _dispose: () => Promise<void> };
    await disposableRoom._dispose();
  });
});
