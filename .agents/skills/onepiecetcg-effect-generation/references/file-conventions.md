# File Conventions

## Target folders

Write effect-definition files only in:

- edition definitions: `packages/api/src/card-effect/definitions/`
- special handlers: `packages/api/src/card-effect/definitions/special/`

## Edition file naming

Edition files must use:

- lowercase edition id
- `.effects.ts` suffix

Examples:

- `op01.effects.ts`
- `op02.effects.ts`
- `st10.effects.ts`

## Edition export naming

Each edition file must export one `EditionEffectDefinitions` constant named:

- lowercase edition id
- `EffectDefinitions` suffix

Examples:

- `op01EffectDefinitions`
- `op02EffectDefinitions`

## Edition file shape

Each edition file must follow this structure:

```ts
import type { EditionEffectDefinitions } from '../types/effect-definition-source';

export const op01EffectDefinitions: EditionEffectDefinitions = {
  editionId: 'OP01',
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

- normalized lowercase card id
- `.special.ts` suffix

Example:

- card id `OP01-047` -> file `op01-047.special.ts`

## Special handler export naming

Keep exports stable and card-specific.

Example from the repo:

- file `op01-047.special.ts`
- export `op01047SpecialHandler`

## Special handler index

The special-handler aggregate file lives here:

- `packages/api/src/card-effect/definitions/special/index.ts`

It must:

1. import every `*.special.ts` export
2. export `specialHandlerDefinitions`
