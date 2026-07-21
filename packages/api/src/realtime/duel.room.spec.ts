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

    await room.onJoin({ sessionId: 'session-a' } as never, {
      authUserId: 'user-a',
      displayName: 'Alice',
      deckId: 'deck-a',
    });
    await room.onJoin({ sessionId: 'session-b' } as never, {
      authUserId: 'user-b',
      displayName: 'Bob',
      deckId: 'deck-b',
    });

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
    expect(room.state.logs.at(-1)?.message).toContain('zones initiales');

    const disposableRoom = room as unknown as { _dispose: () => Promise<void> };
    await disposableRoom._dispose();
  });
});
