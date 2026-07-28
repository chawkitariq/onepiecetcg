# Architecture — Auto Effect Definitions

## Folder Structure

```text
packages/api/src/game/effects/
  definitions/
    generated/
      base-generated-effects.ts
      index.ts
    manual/
      manual-effect-overrides.ts
      index.ts
  special/
    handlers/
      trafalgar-law-on-play.special.ts
    index.ts
  types/
    effect-registry.ts
  effect-engine.ts
  effect-engine.service.ts
  effect-loader.ts
  effect-indexes.ts
  effect-registry.ts
```

Hybrid recommendation:

- `generated/`: aggregated files per generation batch or per set
- `manual/`: curated overrides that generation never touches
- `special/handlers/`: one file per truly exceptional card

## Runtime Loading Strategy

Definitions are TypeScript source files compiled with the app and imported once at startup. The registry is built once in memory and then reused by all matches. No disk I/O, JSON parsing, directory scanning, or schema validation is allowed in the match loop.

JSON recommendation:

- not needed in the match loop
- acceptable at build time if a generator emits TypeScript from JSON data
- acceptable at startup normalization only if there is a one-time import pipeline outside the hot path
- for this MVP, authored and generated TypeScript is the preferred default

Bootstrap flow:

1. Import generated definitions
2. Import manual overrides
3. Import special handlers
4. Normalize `cardId`s
5. Merge generated + manual by `cardId`
6. Build `effectsByCardId`
7. Build `triggeredEffectsByTrigger`
8. Build `replacementEffectsByEventType`
9. Build `specialHandlersByCardId`
10. Freeze the registry

## Registry / Index Recommendation

Use immutable `Record<string, T>` objects for process-level registries and arrays for bucket contents.

- `effectsByCardId`: `Record<string, CardEffectDefinition>`
- `triggeredEffectsByTrigger`: `Record<TriggerType, TriggeredEffectReference[]>`
- `replacementEffectsByEventType`: `Record<EventType, ReplacementEffectReference[]>`
- `specialHandlersByCardId`: `Record<string, SpecialHandlerDefinition>`

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
2. manual overrides
3. special handlers registered separately by `cardId`

Merge semantics:

- generated definitions provide the baseline
- manual overrides win per top-level section when present
- untouched generated sections are preserved
- special handlers stay separate from standard/replacement/continuous indexes

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

## Anti-Patterns

- reading effect files from disk during a match
- parsing JSON during action resolution
- schema-validating every trigger at runtime
- storing generated and manual logic in the same overwrite-prone file
- spreading card-specific branches through the generic resolver
- rebuilding indexes per room
