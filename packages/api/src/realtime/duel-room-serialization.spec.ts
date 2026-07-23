import { createServer } from 'node:http';
import { Server, matchMaker } from 'colyseus';
import { WebSocketTransport } from '@colyseus/ws-transport';
import { Encoder } from '@colyseus/schema';
import { boot, type ColyseusTestServer } from '@colyseus/testing';
import { DuelState, type Card } from '@onepiecetcg/shared';
import {
  DuelRoom,
  configureDuelRoomAuth,
  configureDuelRoomServices,
} from './duel.room';
import { listDescribedDuelRooms } from './lobby';

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

  it('runs a full Leader-vs-Leader combat over the wire and reveals the damaged life card only to the defender (stage 8)', async () => {
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
    const startingClient = startingSessionId === alice.sessionId ? alice : bob;
    const otherClient = startingSessionId === alice.sessionId ? bob : alice;

    startingClient.send('chooseFirstOrSecond', { choice: 'first' });
    await waitUntil(() => !!alice.state.firstPlayerSessionId);
    startingClient.send('mulligan', { mulligan: false });
    otherClient.send('mulligan', { mulligan: false });

    await waitUntil(() => alice.state.phase === 'refresh');

    const attackerClient =
      alice.state.activePlayerSessionId === alice.sessionId ? alice : bob;
    const defenderClient = attackerClient === alice ? bob : alice;

    // First turn cannot attack -- burn it, then take a second full turn cycle.
    attackerClient.send('endPhase', {}); // draw
    attackerClient.send('endPhase', {}); // don
    attackerClient.send('endPhase', {}); // main
    await waitUntil(() => attackerClient.state.phase === 'main');
    attackerClient.send('endPhase', {}); // end
    attackerClient.send('endPhase', {}); // ends turn -> defender becomes active

    await waitUntil(
      () =>
        defenderClient.state.activePlayerSessionId === defenderClient.sessionId,
    );
    defenderClient.send('endPhase', {}); // draw
    defenderClient.send('endPhase', {}); // don
    defenderClient.send('endPhase', {}); // main
    await waitUntil(() => defenderClient.state.phase === 'main');
    defenderClient.send('endPhase', {}); // end
    defenderClient.send('endPhase', {}); // ends turn -> attacker active again, its second turn

    await waitUntil(
      () =>
        attackerClient.state.activePlayerSessionId === attackerClient.sessionId,
    );
    attackerClient.send('endPhase', {}); // draw
    attackerClient.send('endPhase', {}); // don
    attackerClient.send('endPhase', {}); // main
    await waitUntil(() => attackerClient.state.phase === 'main');

    const attackerLeaderInstanceId = attackerClient.state.players.get(
      attackerClient.sessionId,
    )?.zones.leader.instanceId;
    expect(attackerLeaderInstanceId).toBeTruthy();

    const defenderLifeCountBefore = defenderClient.state.players.get(
      defenderClient.sessionId,
    )?.lifeCount;

    attackerClient.send('declareAttack', {
      attackerInstanceId: attackerLeaderInstanceId,
      targetType: 'leader',
    });

    await waitUntil(() => attackerClient.state.combat.step === 'blocked');
    await waitUntil(() => defenderClient.state.combat.step === 'blocked');

    defenderClient.send('declareBlock', { blockerInstanceId: null });
    await waitUntil(() => attackerClient.state.combat.step === 'countering');

    defenderClient.send('finishCounterStep', {});

    await waitUntil(
      () =>
        (defenderClient.state.players.get(defenderClient.sessionId)
          ?.lifeCount ?? 0) < (defenderLifeCountBefore ?? 0),
    );

    expect(attackerClient.state.combat.attackerInstanceId).toBe('');

    const defenderOwnLife = Array.from(
      defenderClient.state.players.get(defenderClient.sessionId)?.zones.hand ??
        [],
    );
    const attackerViewOfDefenderHand = Array.from(
      attackerClient.state.players.get(defenderClient.sessionId)?.zones.hand ??
        [],
    );

    // the revealed life card was added to the defender's own hand, visible in full to them...
    expect(defenderOwnLife.some((card) => !!card.name)).toBe(true);
    // ...but the attacker only ever sees hand card *counts*, never card identities.
    expect(attackerViewOfDefenderHand.every((card) => !card.name)).toBe(true);

    await alice.leave();
    await bob.leave();
  });

  it('lists a hosted room only when it carries a description (stage 9)', async () => {
    colyseus.sdk.auth.token = 'token-alice';
    const undescribed = await colyseus.sdk.create(
      'duel',
      { displayName: 'Alice', deckId: 'deck-a' },
      DuelState,
    );

    const beforeDescribed = await listDescribedDuelRooms();
    expect(
      beforeDescribed.rooms.some((room) => room.roomId === undescribed.roomId),
    ).toBe(false);

    colyseus.sdk.auth.token = 'token-bob';
    const described = await colyseus.sdk.create(
      'duel',
      {
        displayName: 'Bob',
        deckId: 'deck-b',
        description: 'Debutant bienvenu',
      },
      DuelState,
    );

    const afterDescribed = await listDescribedDuelRooms();
    const listing = afterDescribed.rooms.find(
      (room) => room.roomId === described.roomId,
    );

    expect(listing).toBeDefined();
    expect(listing?.description).toBe('Debutant bienvenu');
    expect(listing?.clients).toBe(1);
    expect(listing?.maxClients).toBe(2);

    await undescribed.leave();
    await described.leave();
  });

  it('drops a described room from the listing once it is full (stage 9)', async () => {
    colyseus.sdk.auth.token = 'token-alice';
    const alice = await colyseus.sdk.create(
      'duel',
      {
        displayName: 'Alice',
        deckId: 'deck-a',
        description: 'Cherche partie tranquille',
      },
      DuelState,
    );

    const withOnePlayer = await listDescribedDuelRooms();
    expect(
      withOnePlayer.rooms.some((room) => room.roomId === alice.roomId),
    ).toBe(true);

    colyseus.sdk.auth.token = 'token-bob';
    const bob = await colyseus.sdk.joinById(
      alice.roomId,
      { displayName: 'Bob', deckId: 'deck-b' },
      DuelState,
    );

    const room = matchMaker.getLocalRoomById(alice.roomId);
    await waitUntil(() => room.locked);

    const withTwoPlayers = await listDescribedDuelRooms();
    expect(
      withTwoPlayers.rooms.some((entry) => entry.roomId === alice.roomId),
    ).toBe(false);

    await alice.leave();
    await bob.leave();
  });

  it('drops a described room from the listing once it is abandoned (stage 9)', async () => {
    colyseus.sdk.auth.token = 'token-alice';
    const alice = await colyseus.sdk.create(
      'duel',
      { displayName: 'Alice', deckId: 'deck-a', description: 'Format libre' },
      DuelState,
    );

    const roomId = alice.roomId;
    await alice.leave(true);

    await waitUntil(() => !matchMaker.getLocalRoomById(roomId));

    const afterLeave = await listDescribedDuelRooms();
    expect(afterLeave.rooms.some((room) => room.roomId === roomId)).toBe(false);
  });
});
