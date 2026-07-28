# Architecture — Auto Effect Definitions

## Folder Structure

```text
packages/api/src/game/effects/
  definitions/
    generated/
      op01-006.effect.ts
      index.ts
    overrides/
      op01-047.override.ts
      index.ts
  replacements/
    cannot-be-ko-by-effects.replacement.ts
    index.ts
  continuous/
    plus-1000-during-your-turn.continuous.ts
    index.ts
  special/
    handlers/
      trafalgar-law-on-play.special.ts
    index.ts
  types/
    effect-registry.ts
    effect-definition-source.ts
  loaders/
    effect-loader.ts
  registries/
    effect-registry.ts
  resolvers/
    effect-definition-dispatch.ts
  effect-engine.ts
  effect-engine.service.ts
  effect-loader.ts
  effect-indexes.ts
  effect-registry.ts
  effects.module.ts
```

## Folder Roles

- `definitions/generated/`
  AI-generated card-level declarations. These are the default source of truth for most cards and are safe to regenerate.
- `definitions/overrides/`
  Human-authored full-card replacements for generated definitions that are wrong or incomplete. Override wins by `cardId`.
- `replacements/`
  Reusable replacement primitives only. Put shared mechanics here, not one-off card hacks.
- `continuous/`
  Reusable continuous primitives only. Put shared always-on modifiers here, not one-off card hacks.
- `special/`
  True outlier handlers only. If the logic is card-specific and not meaningfully reusable, it belongs here.
- `types/`
  Authoring and registry contracts used by loaders, registries, resolvers, and the effect engine.
- `loaders/`
  Public bootstrap-facing loading entrypoints.
- `registries/`
  Public runtime-facing registry entrypoints.
- `resolvers/`
  Small dispatch helpers for resolved effect-definition modes.

Hybrid recommendation:

- `generated/`: aggregated files per generation batch or per set
- `overrides/`: curated full-card replacements that generation never touches
- `replacements/`: reusable replacement primitives referenced by generated or override definitions
- `continuous/`: reusable continuous primitives referenced by generated or override definitions
- `special/handlers/`: one file per truly exceptional card
- `loaders/`: stable public loading entrypoints for bootstrap
- `registries/`: stable public registry entrypoints for runtime consumers
- `resolvers/`: small dispatch helpers for resolved definition modes

## Effect Kinds

- `standard`
  Normal triggered or activated DSL effects. These resolve when a specific event window happens.
- `continuous`
  Ongoing derived modifiers or rule changes that stay valid while their condition is true.
- `replacement`
  “Would happen instead” logic that intercepts an event before it applies.
- `special`
  Card-specific custom handlers for outliers that would overcomplicate the generic DSL.
- `override`
  A higher-precedence authored card definition that fully replaces the generated definition for the same `cardId`.

Classification rule:

- If the logic is shared by multiple cards, prefer `standard`, reusable `continuous`, or reusable `replacement`.
- If a continuous or replacement behavior is only meaningful for one card, move it to `special/` instead of pretending it is reusable.

## Runtime Loading Strategy

Definitions are TypeScript source files compiled with the app and imported once at startup. The registry is built once in memory and then reused by all matches. No disk I/O, JSON parsing, directory scanning, or schema validation is allowed in the match loop.

JSON recommendation:

- not needed in the match loop
- acceptable at build time if a generator emits TypeScript from JSON data
- acceptable at startup normalization only if there is a one-time import pipeline outside the hot path
- for this MVP, authored and generated TypeScript is the preferred default

Bootstrap flow:

1. Import generated definitions
2. Import override definitions
3. Import replacement primitives
4. Import continuous primitives
5. Import special handlers
6. Normalize `cardId`s
7. Resolve primitive refs into concrete runtime effects
8. Apply full-card override replacement by `cardId`
9. Build `effectsByCardId`
10. Build `triggeredEffectsByTrigger`
11. Build `replacementEffectsByEventType`
12. Build `specialHandlersByCardId`
13. Freeze the registry

This keeps runtime deterministic:

- no disk reads in matches
- no JSON parsing in matches
- no schema validation in matches
- no deep merge ambiguity

## Registry / Index Recommendation

Use immutable `Record<string, T>` objects for process-level registries and arrays for bucket contents.

- `effectsByCardId`: `Record<string, CardEffectDefinition>`
- `triggeredEffectsByTrigger`: `Record<TriggerType, TriggeredEffectReference[]>`
- `replacementEffectsByEventType`: `Record<EventType, ReplacementEffectReference[]>`
- `specialHandlersByCardId`: `Record<string, SpecialHandlerDefinition>`
- `replacementPrimitivesById`: `Record<string, ReplacementPrimitiveDefinition>`
- `continuousPrimitivesById`: `Record<string, ContinuousPrimitiveDefinition>`

Named registry types exposed in code:

- `EffectDefinition`
- `StandardEffect`
- `ReplacementEffect`
- `ContinuousEffect`
- `TriggerIndex`
- `ReplacementIndex`
- `SpecialHandlerRegistry`

## Record vs Map

Concrete recommendation for this codebase:

- Prefer `Record` for the main effect registry and all process-level indexes
- Prefer arrays for per-trigger and per-event buckets
- Avoid `Map` in the hot path for this MVP

Why:

- keys are stable string ids like `OP01-001`
- the registry is built once and treated as immutable
- property lookup on frozen plain objects is simple and cheap
- arrays are the right shape for “all effects in this bucket”
- `Map` is more useful when frequent mutation is required, which is not the case here

## Merge Strategy

Precedence:

1. generated base definitions
2. full-card overrides
3. special handlers registered separately by `cardId`

Merge semantics:

- generated definitions provide the baseline
- overrides replace the generated definition for the same `cardId`
- special handlers stay separate from standard/replacement/continuous indexes

This is intentionally a full override model, not a partial deep-merge model.

## Performance Notes

What matters at startup:

- normalize ids once
- merge once
- precompute indexes once
- freeze structures once

What matters in the hot path:

- direct card id lookup
- bucket lookup by trigger or replacement event
- no per-match registry rebuilding
- no scanning every effect definition for each action
- no resolving primitive references during actions

## Anti-Patterns

- reading effect files from disk during a match
- parsing JSON during action resolution
- schema-validating every trigger at runtime
- storing generated and manual logic in the same overwrite-prone file
- spreading card-specific branches through the generic resolver
- rebuilding indexes per room
- using `special/` for reusable mechanics
- putting one-off card-specific replacement or continuous logic in primitive folders
