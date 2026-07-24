---
name: colyseus-room-testing
description: Scaffold and review Jest specs for the Colyseus DuelRoom (packages/api/src/realtime). Use when adding a new DuelRoom behavior (turn/phase actions, combat, reconnection) or a new spec file for it.
---

# Colyseus room testing

Conventions for testing `packages/api/src/realtime/duel.room.ts` without a real Colyseus server or WebSocket transport — specs instantiate `DuelRoom` directly and call its lifecycle methods.

## Fixture setup

Every spec mocks `@onepiecetcg/shared` to route through `decks/shared-test.mock.ts`, which re-exports the real schema classes (`DuelCard`, `DuelZones`, `DuelPlayer`, `DuelLog`, `DuelState`, `createDuelCard`) via `jest.requireActual` plus test-only helpers (`normalizeCardId`, `normalizeDeckCards`) — it's a fixture/helper layer, not a schema substitute:

```ts
jest.mock('@onepiecetcg/shared', () => {
  const sharedMock: typeof import('../decks/shared-test.mock') =
    jest.requireActual('../decks/shared-test.mock');
  return sharedMock;
});
```

Reuse fixtures from `decks/shared-test.mock.ts` (leader/character `Card` objects, deck builders) instead of redefining them inline — check it first before adding new fixture cards.

## Joining players

`DuelRoom` needs `configureDuelRoomServices()` called before `onCreate()` because Colyseus instantiates rooms itself, bypassing Nest DI — mock `decksService.getValidatedGameDeck` per test to return whatever deck shape the test needs:

```ts
configureDuelRoomServices({
  decksService: {
    getValidatedGameDeck: jest.fn((authUserId, deckId) =>
      Promise.resolve({ id: deckId, name: 'Valid deck', ownerAuthUserId: authUserId, leader, cards: [...] }),
    ),
  } as never,
});

const room = new DuelRoom();
(room as DuelRoom & { listing: { remove: jest.Mock; metadata: object } }).listing = {
  remove: jest.fn(),
  metadata: {},
};
room.onCreate();
jest.spyOn(room, 'lock').mockImplementation(() => undefined);

await room.onJoin({ sessionId: 'session-a' } as never, { displayName: 'Alice', deckId: 'deck-a' }, { userId: 'user-a' });
await room.onJoin({ sessionId: 'session-b' } as never, { displayName: 'Bob', deckId: 'deck-b' }, { userId: 'user-b' });
```

Extract this into a local `joinTwoPlayers()` helper per spec file (see `duel-room-reconnection.spec.ts`, `duel-room-turn.spec.ts`) rather than repeating it inline in every `it`.

## Reconnection testing

Reconnection uses Colyseus's `allowReconnection` deferred internally — reach into `room._reconnections[reconnectionToken]` to resolve/reject it manually rather than waiting out `RECONNECTION_SECONDS` (120s) in real time:

```ts
const client = fakeClient('session-a');
const leavePromise = room.onLeave(client as never, false); // consented=false triggers the reconnection window
const roomInternals = room as unknown as {
  _reconnections: Record<string, [string, { resolve: (v: unknown) => void }]>;
};
const [, deferred] = roomInternals._reconnections[client.reconnectionToken];
deferred.resolve(client); // or .reject(false) to simulate window expiry
await leavePromise;
```

Always dispose the room at the end of a test (`await (room as unknown as { _dispose: () => Promise<void> })._dispose()`) — Colyseus schedules internal timers (the reconnection window) that leak between tests otherwise.

## What to assert

- **State, not implementation**: assert on `room.state.players`, `room.state.logs`, zone contents — not on internal call counts, unless testing that a service was invoked with the right args.
- **Structural rules only**: per `packages/api/CLAUDE.md`, the server only automates structural fields (`cost`, `power`, `life`, `type`, `colors`). Don't write specs that assume card *text* (Blocker, Counter, Triggers) is interpreted automatically — those stay player-declared actions the room records without validating.
- **Reconnection edge cases to cover for any new player-affecting action**: consented leave (immediate removal), unconsented leave (connected=false, state preserved), reconnect-in-time (state restored, same object identity), and window-expiry (removal + forfeit log).
- **Adding new fixture helpers**: if a test needs a new deck/card shape reused across specs, add it to `decks/shared-test.mock.ts` rather than duplicating fixture objects inline — but don't add schema *substitutes* there, since the mock's whole point is re-exporting the real `@onepiecetcg/shared` schema classes unchanged.

## Running

```bash
pnpm --dir packages/api exec jest src/realtime/duel-room-<name>.spec.ts
```
