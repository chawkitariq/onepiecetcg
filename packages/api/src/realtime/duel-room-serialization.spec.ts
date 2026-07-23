import { createServer } from 'node:http';
import { Server } from 'colyseus';
import { WebSocketTransport } from '@colyseus/ws-transport';
import { Encoder } from '@colyseus/schema';
import { boot, type ColyseusTestServer } from '@colyseus/testing';
import { DuelState, type Card } from '@onepiecetcg/shared';
import {
  DuelRoom,
  configureDuelRoomAuth,
  configureDuelRoomServices,
} from './duel.room';

jest.mock('@onepiecetcg/shared', () => {
  const sharedMock: typeof import('../decks/shared-test.mock') =
    jest.requireActual('../decks/shared-test.mock');

  return sharedMock;
});

// 50-card decks comfortably exceed the 8KB default; grow it once here to
// silence the harmless (auto-recovered) overflow warning during these tests.
Encoder.BUFFER_SIZE = 32 * 1024;

/**
 * `waitForNextPatch()` only resolves on the *next* patch broadcast after it's
 * attached -- if the mutation we care about already happened (e.g. the
 * second player's join, observed from the first player's client), the
 * listener can miss it. Polling the already-synced client state directly is
 * more robust than racing against `waitForNextPatch()`'s timing.
 */
async function waitUntil(
  predicate: () => boolean,
  timeoutMs = 3000,
): Promise<void> {
  const start = Date.now();

  while (!predicate()) {
    if (Date.now() - start > timeoutMs) {
      throw new Error('waitUntil() timed out');
    }

    await new Promise((resolve) => setTimeout(resolve, 25));
  }
}

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

function buildGameServer() {
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

  const sessions: Record<string, { user: { id: string } }> = {
    'token-alice': { user: { id: 'user-a' } },
    'token-bob': { user: { id: 'user-b' } },
  };

  configureDuelRoomAuth((headers) => {
    const authorization = headers.authorization;
    const token = authorization?.startsWith('Bearer ')
      ? authorization.slice('Bearer '.length)
      : undefined;

    return Promise.resolve(token ? (sessions[token] ?? null) : null);
  });

  const gameServer = new Server({
    transport: new WebSocketTransport({ server: createServer() }),
  });
  gameServer.define('duel', DuelRoom);

  return gameServer;
}

/**
 * A real two-socket round trip was previously abandoned in this file because
 * `waitForNextPatch()` never resolved: the room never rebroadcast a patch to
 * an already-connected client once a second player joined. That was a real
 * production bug (Colyseus 0.15.x + `@colyseus/schema` 2.x lost track of
 * nested `MapSchema` mutations once a per-client full-state send happened
 * mid-join), not a test-environment limitation. Upgrading to Colyseus 0.16.x
 * and replacing `@filter`/`@filterChildren` with `StateView`/`@view()` fixed
 * it, so this now exercises the real wire behavior end to end.
 *
 * A single `boot()` is shared across the whole suite (per `@colyseus/testing`
 * docs) with `cleanup()` between tests -- booting a fresh server per test
 * left the shared `sdk` client's underlying HTTP/auth state torn down mid
 * next-test, causing an intermittent "socket hang up".
 */
describe('DuelRoom per-viewpoint serialization', () => {
  let colyseus: ColyseusTestServer;

  beforeAll(async () => {
    colyseus = await boot(buildGameServer());
  });

  afterAll(async () => {
    await colyseus.shutdown();
  });

  beforeEach(async () => {
    await colyseus.cleanup();
  });

  it('publishes zone counters and never replicates authUserId regardless of viewpoint', async () => {
    colyseus.sdk.auth.token = 'token-alice';
    const alice = await colyseus.sdk.joinOrCreate(
      'duel',
      { displayName: 'Alice', deckId: 'deck-a' },
      DuelState,
    );
    colyseus.sdk.auth.token = 'token-bob';
    const bob = await colyseus.sdk.joinOrCreate(
      'duel',
      { displayName: 'Bob', deckId: 'deck-b' },
      DuelState,
    );

    await waitUntil(
      () => (alice.state.players.get(alice.sessionId)?.handCount ?? 0) > 0,
    );
    await waitUntil(
      () => (bob.state.players.get(bob.sessionId)?.handCount ?? 0) > 0,
    );

    const aliceView = alice.state.players.get(alice.sessionId);
    const bobView = bob.state.players.get(bob.sessionId);

    expect(aliceView?.handCount).toBe(5);
    expect(aliceView?.deckCount).toBe(45);
    expect(aliceView?.lifeCount).toBe(0);
    expect(bobView?.handCount).toBe(5);
    expect(bobView?.deckCount).toBe(45);
    expect(bobView?.lifeCount).toBe(0);

    expect((aliceView as { authUserId?: string } | undefined)?.authUserId).toBe(
      undefined,
    );
    expect((bobView as { authUserId?: string } | undefined)?.authUserId).toBe(
      undefined,
    );

    await alice.leave();
    await bob.leave();
  });

  it('reveals hand contents only to the owning client', async () => {
    colyseus.sdk.auth.token = 'token-alice';
    const alice = await colyseus.sdk.joinOrCreate(
      'duel',
      { displayName: 'Alice', deckId: 'deck-a' },
      DuelState,
    );
    colyseus.sdk.auth.token = 'token-bob';
    const bob = await colyseus.sdk.joinOrCreate(
      'duel',
      { displayName: 'Bob', deckId: 'deck-b' },
      DuelState,
    );

    await waitUntil(
      () => (alice.state.players.get(alice.sessionId)?.handCount ?? 0) > 0,
    );
    await waitUntil(
      () => (bob.state.players.get(bob.sessionId)?.handCount ?? 0) > 0,
    );

    const aliceOwnHand = Array.from(
      alice.state.players.get(alice.sessionId)?.zones.hand ?? [],
    );
    const aliceViewOfBobHand = Array.from(
      alice.state.players.get(bob.sessionId)?.zones.hand ?? [],
    );

    expect(aliceOwnHand).toHaveLength(5);
    expect(aliceOwnHand.every((card) => card.name === 'Character')).toBe(true);

    expect(aliceViewOfBobHand).toHaveLength(5);
    expect(aliceViewOfBobHand.every((card) => !card.name)).toBe(true);

    await alice.leave();
    await bob.leave();
  });

  it('runs the full setup sequence over the wire: first/second choice, mulligan, life dealing, first turn', async () => {
    colyseus.sdk.auth.token = 'token-alice';
    const alice = await colyseus.sdk.joinOrCreate(
      'duel',
      { displayName: 'Alice', deckId: 'deck-a' },
      DuelState,
    );
    colyseus.sdk.auth.token = 'token-bob';
    const bob = await colyseus.sdk.joinOrCreate(
      'duel',
      { displayName: 'Bob', deckId: 'deck-b' },
      DuelState,
    );

    await waitUntil(() => alice.state.phase === 'mulligan');
    await waitUntil(() => bob.state.phase === 'mulligan');

    const startingSessionId = alice.state.startingPlayerSessionId;
    expect([alice.sessionId, bob.sessionId]).toContain(startingSessionId);

    const startingClient = startingSessionId === alice.sessionId ? alice : bob;
    const otherClient = startingSessionId === alice.sessionId ? bob : alice;

    startingClient.send('chooseFirstOrSecond', { choice: 'first' });

    await waitUntil(() => !!alice.state.firstPlayerSessionId);
    await waitUntil(() => !!bob.state.firstPlayerSessionId);
    expect(alice.state.firstPlayerSessionId).toBe(startingSessionId);

    startingClient.send('mulligan', { mulligan: false });
    otherClient.send('mulligan', { mulligan: true });

    await waitUntil(() => alice.state.phase === 'refresh');
    await waitUntil(() => bob.state.phase === 'refresh');

    expect(alice.state.turn).toBe(1);
    expect(alice.state.activePlayerSessionId).toBe(startingSessionId);
    expect(alice.state.players.get(alice.sessionId)?.lifeCount).toBeGreaterThan(
      0,
    );
    expect(bob.state.players.get(bob.sessionId)?.lifeCount).toBeGreaterThan(0);

    await alice.leave();
    await bob.leave();
  });
});
