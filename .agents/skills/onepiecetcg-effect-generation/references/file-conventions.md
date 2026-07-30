# File Conventions

## Target folders

Write effect-definition files only in:

- edition definitions: `packages/api/src/card-effect/definitions/`
- special handlers: `packages/api/src/card-effect/definitions/<EDITION>/special/` (e.g. `OP/special/`, `ST/special/`)
- shared handler utilities: `packages/api/src/card-effect/definitions/` (`special-handler-utils.ts`)

## Edition file naming

Edition files must use:

- the hyphenated catalog-style edition id (e.g. `OP-01` → `op-01`)
- `.effects.ts` suffix

Examples:

- `OP-01.effects.ts`
- `OP-02.effects.ts`
- `ST-10.effects.ts`

## Edition test file naming

Edition-specific effect test files must use the same base name as the edition definition file, with `.spec.ts` appended before the final extension.

Examples:

- `OP-01.effects.ts` -> `OP-01.effects.spec.ts`
- `OP-02.effects.ts` -> `OP-02.effects.spec.ts`
- `ST-10.effects.ts` -> `ST-10.effects.spec.ts`

## Edition export naming

Each edition file must export one `EditionEffectDefinitions` constant named:

- lowercase edition id with any dashes removed
- `EffectDefinitions` suffix

Examples:

- `op01EffectDefinitions`
- `op02EffectDefinitions`

## Edition file shape

Each edition file must follow this structure:

```ts
import type { EditionEffectDefinitions } from '../types/effect-definition-source';

export const op01EffectDefinitions: EditionEffectDefinitions = {
  editionId: 'OP-01',
  cards: [
    // card blocks
  ],
};
```

## Card block conventions

- keep `cardId` uppercase
- keep card comments directly above the block
- keep existing authored card blocks unchanged when regenerating
- add new placeholders in metadata order

## Definitions index file

The aggregate edition index lives here:

- `packages/api/src/card-effect/definitions/index.ts`

It must:

1. import every edition export
2. export `effectDefinitionEditions`
3. match the set of existing `*.effects.ts` files

## Special handler naming

Special-handler files must use:

- uppercase card id
- `.special.ts` suffix

Example:

- card id `OP01-047` -> file `OP01-047.special.ts`

## Special handler export naming

Keep exports stable and card-specific.

Example from the repo:

- file `OP01-047.special.ts`
- export `op01047SpecialHandler`

## Per-edition special handler index

Each edition must have a per-edition special index at:

- `packages/api/src/card-effect/definitions/<EDITION>/special/index.ts`

It must:

1. import every `*.special.ts` export within that edition's `special/` directory
2. export an aggregated array named `<edition>SpecialHandlers` (e.g. `opSpecialHandlers`, `stSpecialHandlers`, `ebSpecialHandlers`)

## Root special handler aggregator

The global aggregate file lives here:

- `packages/api/src/card-effect/definitions/special/index.ts`

It must:

1. import every per-edition `special/index.ts`
2. spread them into a single `specialHandlerDefinitions` array
