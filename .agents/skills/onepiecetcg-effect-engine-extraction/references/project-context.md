# Project Context

## Ownership Split

- `packages/effect-engine/`
  - Own pure effect runtime code.
  - Own public package exports, runtime contracts, registry assembly, and package-local runtime tests.
  - Stay reusable by API adapters and any future non-Colyseus integration.
- `packages/cards/effects/`
  - Own authored effect definitions, special handlers, effect-source indexes, and their dedicated card-level tests.
  - Stay reusable by both `packages/api/` and `packages/effect-engine/`.
- `packages/api/src/card-effect/`
  - Own Nest-facing assembly only.
  - Keep `EffectsModule` and any Nest service or factory that instantiates the engine package.
- `packages/api/src/duel/effects/`
  - Own room-scoped adapters and orchestration.
  - Own `createDuelEffectEngineHost`, `DuelEffectEventDispatcher`, `DuelRoomEffectBoundary`, manual trigger fallback, and other room concerns.
- `packages/shared/`
  - Own shared effect DSL, state objects, and types used by both packages.

## Typical Legacy Hotspots

- `packages/api/src/card-effect/definitions/`
- `packages/api/src/card-effect/runtime/`
- `packages/api/src/card-effect/types/`
- `packages/api/src/card-effect/effect-engine.ts`
- `packages/api/src/card-effect/effect-loader.ts`
- `packages/api/src/card-effect/effect-registry.ts`
  - These should disappear from API once the extraction is complete.
- `packages/api/package.json`
  - Check `moduleNameMapper` and `transformIgnorePatterns` for temporary extraction-era aliases.
- `pnpm-workspace.yaml`
  - Ensure the new package is registered.

## Classification Heuristic

Move a file to `packages/effect-engine` when it:
- resolves or executes effect behavior
- owns effect registry bootstrapping or indexes
- depends only on `@onepiecetcg/shared` plus public engine contracts
- should be reusable outside the current NestJS and Colyseus runtime

Keep a file in `packages/cards/effects` when it:
- defines authored effect cards or special handlers
- aggregates edition definitions or special-handler bundles
- tests card-specific authored behavior or special handlers

Keep a file in `packages/api` when it:
- depends on NestJS modules or services
- depends on room lifecycle or manual fallback orchestration
- translates room events into engine events
- wires the engine host to room state mutation methods

Keep a file in `packages/shared` when it:
- defines shared effect DSL, selectors, or wire-safe types
- should remain identical across engine and clients

## Validation Loop

Run the smallest useful checks for the touched surface:

1. `pnpm --dir packages/api typecheck`
2. `packages/api/node_modules/.bin/tsc -p packages/effect-engine/tsconfig.json --noEmit`
3. `node_modules/.bin/vitest run --config vitest.config.ts`
   - Run this from `packages/effect-engine/`
4. Focused API adapter tests, for example:
   - `pnpm --dir packages/api exec jest src/duel/effects/duel-room-effect-boundary.spec.ts src/duel/effects/duel-effect-engine-host.spec.ts`

After each refactor wave, grep for leftovers:

- `rg -n "@onepiecetcg/effect-engine|@onepiecetcg/cards/effects|../../card-effect|../card-effect" packages/api/src -g '*.ts'`
- `rg -n "card-effect/(definitions|runtime|types)|../../card-effect|../card-effect" packages/api packages/effect-engine -g '*.ts'`
- `rg -n "@nestjs|colyseus|Room|Client|StateView" packages/effect-engine/src -g '*.ts'`

The goal is:
- no runtime implementation left under `packages/api/src/card-effect/`
- no API-specific dependencies inside `packages/effect-engine`
- API consuming the engine through public package imports only
