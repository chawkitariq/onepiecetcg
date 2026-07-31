# Architecture — Auto Effect Definitions

## Architecture Summary

The effect system is edition-based, bootstrap-loaded, and entirely in memory at runtime.
`definitions/` is the single source of truth for card effect declarations, grouped one file per
edition. Most cards stay declarative through a typed DSL. `definitions/special/` is reserved for the rare
outlier card whose behavior would be awkward or unsafe to force into the DSL.

At startup, the server imports every edition file, normalizes `cardId`s, validates duplicate
definitions and special-handler references, builds lookup indexes once, and freezes the resulting
registry. Matches never read effect files from disk and never rebuild global indexes.

## Folder Structure

```text
apps/api/src/card-effect/
  definitions/
    index.ts
    op01.effects.ts
    op02.effects.ts
    op05.effects.ts
    special/
      handlers/
      op01-047.special.ts
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

## Folder Responsibilities

- `definitions/`
  Edition-based card declarations. One file per set or release. This is the only place where most
  card effect behavior should be authored.
- `definitions/special/`
  True outlier card-specific imperative handlers only. Use this when the DSL would be unclear,
  brittle, or disproportionately complex.
- `types/`
  Source authoring contracts and runtime registry contracts.
- `loaders/`
  Bootstrap-only loading and normalization. This is where edition files become a resolved registry.
- `registries/`
  Stable runtime entrypoints for immutable process-level registries.
- `resolvers/`
  Small helpers that let consumers inspect which runtime effect modes a resolved card uses.

## Card Definition Model

Each edition file exports an array of card definitions grouped under one edition object:

```ts
type CardEffectEntry =
  | { kind: 'standard'; effect: StandardEffectDefinition }
  | { kind: 'continuous'; effect: ContinuousEffectDefinition }
  | { kind: 'replacement'; effect: ReplacementEffectDefinition }
  | { kind: 'special-ref'; specialHandlerId: string };

type CardEffectSource = {
  cardId: string;
  effects?: readonly CardEffectEntry[];
};

type EditionEffectDefinitions = {
  editionId: string;
  cards: readonly CardEffectSource[];
};
```

This keeps each card self-describing. The loader can infer the runtime mode directly from each
entry’s `kind`, without any generated/override layering or primitive indirection.

## Runtime Auto-Resolution

- `standard`
  Triggered or activated effects that resolve from an event window such as `onPlay`,
  `whenAttacking`, or `trigger`.
- `continuous`
  Ongoing modifiers or rules that remain active while their conditions hold.
- `replacement`
  “Would happen instead” logic that intercepts an event before the base event applies.
- `special-ref`
  A pointer to an imperative handler in `definitions/special/` for rare card-specific outliers.

The loader walks each card’s `effects` array once and distributes entries into the runtime
`standard`, `continuous`, `replacements`, and `specialHandlerId` fields on
`CardEffectDefinition`.

## Bootstrap Loading

1. Import all edition files from `definitions/index.ts`.
2. Import all special handlers from `definitions/special/index.ts`.
3. Normalize every `cardId`.
4. Validate duplicate card definitions across editions.
5. Validate that every `special-ref` points to a real special handler for the same `cardId`.
6. Resolve each card into a runtime `CardEffectDefinition`.
7. Build `effectsByCardId`.
8. Build trigger and replacement indexes once.
9. Freeze the registry.

This keeps the hot path deterministic:

- no disk access during matches
- no dynamic file scanning
- no per-match registry rebuilds
- no runtime authoring-shape branching outside the bootstrap phase

## Runtime Registries and Indexes

Use immutable `Record<string, T>` objects for process-level registries and arrays for bucket
contents.

- `effectsByCardId`
  `Record<string, CardEffectDefinition>`
- `triggeredEffectsByTrigger`
  `Record<TriggerType, TriggeredEffectReference[]>`
- `replacementEffectsByEventType`
  `Record<EventType, ReplacementEffectReference[]>`
- `specialHandlersByCardId`
  `Record<string, SpecialHandlerDefinition>`

## Arrays vs Records

Edition files should export arrays, not per-edition records.

Why:

- adding another card to an edition file is append-friendly and review-friendly
- preserving author order is useful when reading or curating effect coverage
- duplicate `cardId` detection can stay centralized in the bootstrap loader
- the runtime registry is still a `Record` after normalization, so lookup stays O(1)

## Anti-Patterns

- reading effect files from disk during a match
- rebuilding indexes per room or per action
- reintroducing generated/override layers for MVP behavior authoring
- splitting one-off continuous or replacement logic into fake “reusable” folders
- forcing an awkward imperative card into the DSL when `definitions/special/` would be clearer
- scattering card behavior across multiple folders when one edition file would do

## Final Recommendation

Keep the current engine runtime and registry shape, but author effects through edition files in
`definitions/` and reserve `definitions/special/` for true exceptions. That is the simplest architecture that
still stays deterministic, scalable enough for MVP coverage, and easy to extend by adding one more
`<edition-id>.effects.ts` file.
