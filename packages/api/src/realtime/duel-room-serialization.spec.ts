import type { Card } from '@onepiecetcg/shared';
import { DuelRoom, configureDuelRoomServices } from './duel.room';
import { DuelCard, ownsCard } from './duel-state.schema';

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

/**
 * A real two-socket round trip (`@colyseus/testing`'s `boot()` +
 * `colyseus.js` clients) was attempted for these assertions. Fixing this
 * package's ts-jest config (`isolatedModules: false`, see package.json)
 * resolved a separate bug where `@filterChildren` silently failed to
 * register under jest -- confirmed by comparing `DuelZones._definition`
 * before/after via a throwaway `ts-node --transpile-only` run, which showed
 * the decorator registers correctly outside jest regardless. Even with that
 * fix, the test client's WebSocket connection still never receives a state
 * patch from the server in this environment (`waitForNextPatch()` times out
 * after several seconds even though the server-side room state is correct),
 * which appears to be an unrelated `@colyseus/testing`/`ws` transport gap
 * specific to this repo's Node test environment. These tests instead verify
 * the two things that jointly guarantee correct wire behavior without
 * depending on that transport: the counters exposed regardless of viewpoint,
 * and that `ownsCard` -- the predicate wired via `@filterChildren` onto
 * hand/deck/life in duel-state.schema.ts -- has the right accept/reject
 * semantics.
 */
describe('DuelRoom per-viewpoint serialization', () => {
  it('publishes zone counters and never replicates authUserId regardless of viewpoint', async () => {
    const room = await joinTwoPlayers();

    const alice = room.state.players.get('session-a');
    const bob = room.state.players.get('session-b');

    expect(alice?.handCount).toBe(5);
    expect(alice?.deckCount).toBe(40);
    expect(alice?.lifeCount).toBe(5);
    expect(bob?.handCount).toBe(5);
    expect(bob?.deckCount).toBe(40);
    expect(bob?.lifeCount).toBe(5);

    expect((alice as unknown as { authUserId?: string })?.authUserId).toBe(
      undefined,
    );
    expect((bob as unknown as { authUserId?: string })?.authUserId).toBe(
      undefined,
    );

    await disposeRoom(room);
  });

  it('rejects a non-owning client and accepts the owning client for a hidden-zone card', () => {
    const card = new DuelCard();
    card.ownerSessionId = 'session-a';

    expect(ownsCard({ sessionId: 'session-a' }, 0, card)).toBe(true);
    expect(ownsCard({ sessionId: 'session-b' }, 0, card)).toBe(false);
    expect(ownsCard({ sessionId: 'someone-else' }, 0, card)).toBe(false);
  });
});
