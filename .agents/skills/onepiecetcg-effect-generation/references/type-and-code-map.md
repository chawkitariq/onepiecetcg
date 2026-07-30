# Type And Code Map

## Purpose

Use this reference when you need the exact source files for the effect-definition DSL, authoring types, runtime registry contracts, loader behavior, or special-handler code.

## Read order by need

- Need the metadata card shape:
  Read `packages/shared/src/index.ts`
- Need the effect DSL types:
  Read `packages/shared/src/effects.ts`
- Need the authoring source shape used by `*.effects.ts` files:
  Read `packages/api/src/card-effect/types/effect-definition-source.ts`
- Need the runtime registry contracts:
  Read `packages/api/src/card-effect/types/effect-registry.ts`
- Need to understand how authored source becomes runtime buckets:
  Read `packages/api/src/card-effect/effect-loader.ts`
- Need to understand the precomputed indexes:
  Read `packages/api/src/card-effect/effect-indexes.ts`
- Need to inspect example authored edition files:
  Read `packages/api/src/card-effect/definitions/OP-01.effects.ts`
- Need to inspect a real special handler:
  Read `packages/api/src/card-effect/definitions/special/OP01-047.special.ts`
- Need to inspect helper accessors over resolved definitions:
  Read `packages/api/src/card-effect/effect-definition-dispatch.ts`
- Need to inspect runtime event and special-handler host types:
  Read `packages/api/src/card-effect/effect-engine.ts`

## Shared card metadata types

### `packages/shared/src/index.ts`

Use this file for:

- `Card`
- `CardType`
- `CardColor`

These are the metadata contracts the skill normalizes into before deciding whether a card needs an effect-definition entry.

Relevant fields on `Card`:

- `id`
- `name`
- `type`
- `colors`
- `cost`
- `power`
- `life`
- `counter`
- `attributes`
- `families`
- `text`
- `trigger`

## Shared effect DSL types

### `packages/shared/src/effects.ts`

This is the main DSL reference.

Read it when authoring or reviewing:

- `EffectTriggerType`
- `EffectCondition`
- `EffectCardFilter`
- `EffectTargetSelector`
- `EffectDuration`
- `EffectTrigger`
- `EffectAction`
- `StandardEffectDefinition`
- `ContinuousEffectDefinition`
- `ReplacementEffectDefinition`
- `CardEffectDefinition`

This file tells you which fields are legal inside authored `effects` entries.

## Authoring source types

### `packages/api/src/card-effect/types/effect-definition-source.ts`

This file defines the source shape used inside edition files:

- `SpecialHandlerId`
- `CardEffectEntry`
- `CardEffectSource`
- `EditionEffectDefinitions`

This is the direct contract for:

- `packages/api/src/card-effect/definitions/*.effects.ts`

If you are unsure how a card block should be structured, start here.

## Runtime registry contracts

### `packages/api/src/card-effect/types/effect-registry.ts`

This file defines the runtime-side contracts that the loader builds:

- `CardId`
- `TriggerType`
- `EventType`
- `SpecialHandlerDefinition`
- `EffectSourceBundle`
- `TriggeredEffectReference`
- `ReplacementEffectReference`
- `TriggerIndex`
- `ReplacementIndex`
- `SpecialHandlerRegistry`
- `EffectRegistry`

Read this file when deciding:

- what a special handler must export
- what ids must stay aligned
- how runtime lookup is organized

## Loader behavior

### `packages/api/src/card-effect/effect-loader.ts`

This file explains how authored source is resolved at runtime:

1. load edition definitions
2. load special handlers
3. split card entries into runtime `standard`, `continuous`, `replacements`, and `specialHandlerId`
4. validate special-handler references
5. build the immutable registry

Read this file when deciding how a declarative source entry will be interpreted after authoring.

## Index-building behavior

### `packages/api/src/card-effect/effect-indexes.ts`

This file shows how runtime indexes are built for:

- trigger-driven standard effects
- replacement effects by event type

Read it when a new authored definition should be discoverable through a trigger or replacement event.

## Example authored definition files

### `packages/api/src/card-effect/definitions/OP-01.effects.ts`

Use as the primary example for:

- `standard` effect entries
- `continuous` effect entries
- `special-ref` entries
- comment banner format

### `packages/api/src/card-effect/definitions/index.ts`

Use as the example for:

- aggregate edition imports
- `effectDefinitionEditions`

## Example special-handler files

### `packages/api/src/card-effect/definitions/special/OP01-047.special.ts`

Use as the primary example for:

- `SpecialHandlerDefinition`
- handler `id`
- handler `cardId`
- `resolve(event, engine)` shape
- queueing a synthetic `StandardEffectDefinition`

### `packages/api/src/card-effect/definitions/special/index.ts`

Use as the example for:

- aggregate special-handler imports
- `specialHandlerDefinitions`

## Helper accessors and runtime engine context

### `packages/api/src/card-effect/effect-definition-dispatch.ts`

Read this file for small helpers that expose the resolved runtime arrays:

- standard effects
- continuous effects
- replacement effects

### `packages/api/src/card-effect/effect-engine.ts`

Read this file when a special handler needs runtime context details such as:

- `EffectEventType`
- `EffectEvent`
- `ReplacementQuery`
- `EffectEngineHost`

This is the runtime context contract that imperative handlers interact with.
