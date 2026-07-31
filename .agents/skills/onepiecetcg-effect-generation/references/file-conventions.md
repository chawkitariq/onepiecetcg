# File Conventions

## Target folders

Write effect-definition files only in:

- edition definitions: `packages/cards/src/effects/<FAMILY>/`
- special handlers: `packages/cards/src/effects/<FAMILY>/special/` (e.g. `OP/special/`, `ST/special/`)
- shared handler utilities: `packages/cards/src/effects/` (`special-handler-utils.ts`)

## Edition file naming

Edition files must use:

- the hyphenated catalog-style edition id (e.g. `OP-01`)
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
import type { EditionEffectDefinitions } from '@onepiecetcg/shared';

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

The root aggregate index lives here:

- `packages/cards/src/effects/index.ts`

It must:

1. import every family index
2. export `effectDefinitionEditions`
3. export `specialHandlerDefinitions`
4. match the set of existing family folders

## Family index file

Each family folder must have an index here:

- `packages/cards/src/effects/<FAMILY>/index.ts`

It must:

1. import every edition export inside that family
2. import `<family>SpecialHandlers` from `./special`
3. export `<familyLower>EditionEffectDefinitions`
4. export `<familyLower>EditionSpecialHandlers`

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

- `packages/cards/src/effects/<FAMILY>/special/index.ts`

It must:

1. import every `*.special.ts` export within that edition's `special/` directory
2. export an aggregated array named `<edition>SpecialHandlers` (e.g. `opSpecialHandlers`, `stSpecialHandlers`, `ebSpecialHandlers`)
