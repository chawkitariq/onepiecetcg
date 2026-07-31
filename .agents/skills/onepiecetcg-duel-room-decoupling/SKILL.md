---
name: onepiecetcg-duel-room-decoupling
description: Refactor this repository's duel runtime so pure gameplay code lives in `packages/duel-engine` and room-specific orchestration stays in `packages/api`. Use when extracting engine code out of `packages/api/src/duel`, defining public contracts for the engine, moving duel-engine tests into its own package, deleting compatibility wrappers or legacy import paths, or deciding whether duel logic belongs in the engine package, the API room adapters, or shared types.
---

# OPTCG Duel Room Decoupling

Separate pure duel runtime code from room-specific infrastructure without leaving compatibility shims behind.

## Workflow

1. Read `references/project-context.md` before changing files. It defines the ownership split, the legacy hotspots, and the validation loop for this repo.
2. Read `docs/spec.md` and `docs/optcg-rules.md` before moving gameplay code. If turn, phase, combat, KO, DON!!, or hidden-information behavior changes, also read `docs/rule_comprehensive.md`.
3. Inventory the touched files and classify each one:
   - pure duel engine
   - room/API adapter
   - shared schema or type
   - obsolete compatibility wrapper
4. Move pure runtime code into `packages/duel-engine` first, and expose it through explicit public contracts instead of importing API details.
5. Keep only adapters in `packages/api/src/duel/room/`:
   - Colyseus room orchestration
   - `DuelRoomEffectBoundary`
   - lifecycle, event outbox, client views, persistence, auth, stats, and other Nest/Colyseus concerns
6. Move engine-owned tests into `packages/duel-engine`, keep adapter tests in `packages/api`, and remove duplicate coverage left behind in API.
7. Retarget API imports directly to `@onepiecetcg/duel-engine` when a wrapper exists only to preserve an old path.
8. Delete compatibility re-export files and legacy folders once all imports are updated. Do not keep `export * from '@onepiecetcg/duel-engine'` facades unless there is a real boundary reason.
9. Run the focused validation loop from `references/project-context.md` until typecheck and targeted tests pass.

## Working Rules

- Treat `packages/duel-engine` as framework-agnostic. Do not leave NestJS, Colyseus room classes, stats services, deck services, or room persistence logic inside it.
- Prefer public interfaces in `packages/duel-engine/src/contracts.ts` when the engine needs capabilities supplied by API adapters.
- Keep `packages/shared` for shared state/types only. Do not move gameplay orchestration there.
- When a file exists only to preserve the old pre-extraction path, remove it instead of renaming the architecture around it.
- When you move code out of API, also move or rewrite its tests so the owning package proves its own behavior.
- If `packages/api/package.json` contains temporary Jest aliasing or transform config added only for the extraction transition, remove it once API no longer tests engine sources through legacy paths.
- Never run package build commands for validation in this repo. Use typecheck and focused tests only.
- Always ask before adding a new dependency.

## Resources

- `references/project-context.md`
