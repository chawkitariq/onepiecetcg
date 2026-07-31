---
name: onepiecetcg-effect-engine-extraction
description: Extract this repository's card effect runtime out of `packages/api` into a standalone `packages/effect-engine` package. Use when moving `packages/api/src/card-effect/**` into a reusable engine package, defining public effect-engine contracts, retargeting API adapters to `@onepiecetcg/effect-engine`, moving engine-owned tests out of API, deleting compatibility leftovers, or deciding whether effect runtime code belongs in the reusable package, the API room adapters, or shared types.
---

# OPTCG Effect Engine Extraction

Extract the effect engine into its own reusable package without leaving API-specific implementation details behind.

## Workflow

1. Read `references/project-context.md` before changing files. It defines the ownership split, the usual legacy hotspots, and the validation loop.
2. Read `docs/spec.md` and `docs/optcg-rules.md` before moving effect behavior. If trigger timing, KO handling, replacement effects, combat windows, or turn windows change, also read `docs/rule_comprehensive.md`.
3. Inventory the touched files and classify each one:
   - pure effect engine
   - API or room adapter
   - shared DSL or schema type
   - obsolete compatibility file
4. Create or update `packages/effect-engine` first, then move pure runtime files there:
   - engine runtime
   - runtime helper classes
   - effect registry and indexes
   - authored effect definitions
   - special handlers
   - engine-owned tests
5. Expose the package through explicit public exports and public host interfaces. The package must depend on `@onepiecetcg/shared`, not on NestJS, Colyseus, or local API paths.
6. Reduce `packages/api/src/card-effect/` to API-facing assembly only:
   - Nest module
   - Nest service or factory that instantiates the engine
7. Keep room-specific adapters in `packages/api/src/duel/effects/`:
   - `createDuelEffectEngineHost`
   - `DuelEffectEventDispatcher`
   - `DuelRoomEffectBoundary`
   - manual trigger fallback and other room orchestration concerns
8. Retarget API imports directly to `@onepiecetcg/effect-engine`. Do not keep `packages/api/src/card-effect/**` runtime re-export facades unless they are still true API composition roots.
9. Delete compatibility leftovers once imports are updated:
   - old runtime folders under `packages/api/src/card-effect/`
   - moved definitions left behind in API
   - stale Jest aliasing added only for the transition
10. Run the validation loop from `references/project-context.md` until the package and API adapters both pass.

## Working Rules

- Treat `packages/effect-engine` as framework-agnostic. Do not leave NestJS services, Colyseus room classes, room persistence, auth, or networking logic inside it.
- Prefer public host contracts and exported types from `packages/effect-engine/src/index.ts`.
- Keep `packages/shared` for shared effect DSL and state types only. Do not move runtime orchestration there.
- Move the engine's authored definitions and special handlers with the engine package. They are part of the reusable runtime surface.
- Move or rewrite engine-owned tests so `packages/effect-engine` proves its own behavior locally.
- If you run `vitest` inside `packages/effect-engine`, scope it to that package's config so it does not sweep unrelated repo suites.
- Never run package build commands for validation in this repo. Use typecheck and focused tests only.
- Always ask before adding a new dependency.

## Resources

- `references/project-context.md`
