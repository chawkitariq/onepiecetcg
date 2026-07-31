# Project Context

## Read First

Use this skill for engine-extension work inside this repository only.

Read these files before deciding how to extend support:

- `docs/spec.md`
- `docs/optcg-rules.md`
- `docs/rule_comprehensive.md`

## Runtime Map

These files define how card effects are authored, loaded, and resolved:

- `packages/shared/src/effects.ts`
  - Shared DSL contract used by authored effect definitions.
  - Add new reusable actions, conditions, selectors, durations, decision payloads, or replacement event types here first.
- `packages/effect-engine/src/effect-engine.ts`
  - Runtime interpreter for `EffectAction[]`, condition evaluation, decision pauses, replacement handling, and continuous power recomputation.
  - This is the main file to extend when a new DSL concept exists but the engine cannot execute it yet.
- `packages/effect-engine/src/effect-loader.ts`
  - Converts authored edition sources into runtime registry entries.
  - Update when a new authored entry shape or special-reference rule needs loader support.
- `packages/effect-engine/src/effect-indexes.ts`
  - Builds trigger and replacement indexes.
  - Update when a new trigger or replacement event type is added.
- `packages/effect-engine/src/types/effect-definition-source.ts`
  - Source-file contracts for authored edition definitions.
  - Update only if the authored file shape itself changes.
- `packages/effect-engine/src/types/effect-registry.ts`
  - Runtime registry contracts and special-handler types.
  - Update when a new registry concept must become explicit.
- `packages/effect-engine/src/effect-definition-dispatch.ts`
  - Read-only helpers that expose which effect mode a resolved definition uses.

## Authored Definition Map

- `packages/effect-engine/src/definitions/<FAMILY>/*.effects.ts`
  - Edition-level authored effect-definition files, grouped by family such as `OP`, `ST`, or `EB`.
  - Add reusable DSL-based card support here after the engine can represent it.
- `packages/effect-engine/src/definitions/<FAMILY>/special/*.special.ts`
  - Card-specific imperative handlers.
  - Use only when the behavior is too card-specific or too sequential for the current DSL.
- `packages/effect-engine/src/definitions/<FAMILY>/index.ts`
  - Registers one family of edition definitions plus that family's special handlers.
- `packages/effect-engine/src/definitions/index.ts`
  - Registers all family definition groups and the aggregated `specialHandlerDefinitions`.

## Test Map

- `packages/effect-engine/src/effect-engine.spec.ts`
  - Primary place for unit tests covering runtime action resolution, decision flow, and continuous/replacement behaviors.
- `packages/effect-engine/src/effect-loader.spec.ts`
  - Primary place for registry/bootstrap validation such as duplicate cards, missing special handlers, or index wiring.

## Existing Examples

- `packages/effect-engine/src/definitions/OP/OP-01.effects.ts`
  - Canonical examples of `standard`, `continuous`, and `special-ref` authored entries.
- `packages/effect-engine/src/definitions/OP/special/OP04-047.special.ts`
  - Canonical example of a card-specific special handler.

## Relationship With Effect Generation

This skill complements `.agents/skills/onepiecetcg-effect-generation/`.

Use `onepiecetcg-effect-generation` to derive effect definitions from card metadata.
Use this skill when that generation is blocked because the engine or DSL lacks a required capability.
