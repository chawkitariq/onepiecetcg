# Project Context

## Ownership Split

- `packages/duel-engine/`
  - Own pure duel runtime code.
  - Own public engine contracts and package-local tests.
  - Stay reusable by API adapters, the effect engine, and future Colyseus integrations.
- `packages/api/src/duel/room/`
  - Own `DuelRoom` orchestration and room-scoped adapters.
  - Own `DuelRoomEffectBoundary`, lifecycle, leave handling, event persistence, client-view rebuilding, and Colyseus/Nest bindings.
- `packages/shared/`
  - Own shared state objects and types used by both packages.

## Typical Legacy Hotspots

- `packages/api/src/duel/game-engine/`
  - Old engine location. Remove it after imports are retargeted.
- `packages/api/src/duel/room/duel-room-card-keyword-snapshot.ts`
- `packages/api/src/duel/room/duel-room-character-ko.ts`
- `packages/api/src/duel/room/duel-room-runtime-state.ts`
- `packages/api/src/duel/room/duel-room-state-copy.ts`
  - If these only re-export from `@onepiecetcg/duel-engine`, delete them.
- `packages/api/package.json`
  - Check Jest `moduleNameMapper` and `transformIgnorePatterns` for temporary extraction-era compatibility config.

## Classification Heuristic

Move a file to `packages/duel-engine` when it:
- operates on `DuelState`, players, zones, phases, combat, KO, DON!!, card queries, or state cloning
- can depend on abstract interfaces instead of room implementations
- should be reusable outside the current Colyseus room

Keep a file in `packages/api` when it:
- depends on `Room`, `Client`, `StateView`, NestJS services, stats persistence, deck loading, or room event streams
- implements `DuelRoomEffectBoundary`
- adapts engine contracts to room behavior

## Validation Loop

Run the smallest useful checks for the touched surface:

1. `pnpm --dir packages/api typecheck`
2. `packages/api/node_modules/.bin/tsc -p packages/duel-engine/tsconfig.json --noEmit`
3. `pnpm --dir packages/duel-engine test --run` when engine tests moved or changed
4. Focused Jest suites in `packages/api` for remaining adapters, for example:
   - `duel-room-runtime-assembly.spec.ts`
   - `duel-room-runtime-bootstrap.spec.ts`
   - `duel-room-ko-runtime.spec.ts`
   - `duel-room-character-ko-deps.spec.ts`

After each refactor wave, grep for obsolete imports:

- `rg -n "game-engine/duel-|duel-room-(card-keyword-snapshot|character-ko|runtime-state|state-copy)" packages/api/src -g '*.ts'`

The goal is zero legacy-path usage unless a file is still a real adapter rather than a compatibility shim.
