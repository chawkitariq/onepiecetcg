# Effect Generation Rules

## Goal

Generate edition effect-definition files from card metadata without relying on backend CLI code.

## Meaning of generation in this skill

Generation in this skill is deterministic scaffolding, not semantic auto-completion.

The generator must:

1. load card metadata
2. group cards by edition id
3. keep only cards that need an effect-definition entry
4. preserve already-authored card blocks exactly
5. create placeholder blocks for uncovered cards
6. rewrite the edition file and `definitions/index.ts`
7. refresh `definitions/special/index.ts`
8. validate the result

## Edition selection

The `--edition` argument is required.

Accepted examples:

- `--edition OP01`
- `--edition OP01,OP02`

The skill normalizes edition ids to uppercase before using them.

## How to derive the edition from card metadata

Take the prefix before the first `-` in the card id.

Examples:

- `OP01-006` -> `OP01`
- `ST10-001` -> `ST10`

If a card id does not contain `-`, treat it as malformed for normal edition placement.

## Generation algorithm

For each requested edition:

1. Read the existing authored edition file if it already exists.
2. Build the ordered target card list from metadata.
3. Keep only cards whose metadata indicates they need effect definitions.
4. Append any already-authored card ids from that edition that were absent from the current metadata input, so authored work is not lost.
5. For each target card id:
   - if an authored block already exists, keep that block unchanged
   - otherwise, generate a deterministic placeholder block

## Placeholder block shape

For uncovered cards, generate:

1. a comment banner derived from metadata
2. a minimal object with `cardId`
3. no guessed `effects` array

Example:

```ts
// OP01-999 Skill Test Card
// [On Play] Draw 1 card.
{
  cardId: 'OP01-999',
}
```

This is intentional. The skill prepares the correct file placement and coverage; the calling model then authors the DSL.

## How authored effects must be added later

When replacing a placeholder with a real definition, add `effects` using only these kinds:

- `standard`
- `continuous`
- `replacement`
- `special-ref`

Use `special-ref` only when the card truly needs a special handler in `definitions/special/`.

## Mandatory rules source

Before converting card text into DSL:

- read `docs/rule_comprehensive.md`
- use `docs/optcg-rules.md` only as a faster summary

Use the comprehensive rules especially for:

- trigger timing
- replacement windows
- impossible actions
- zone changes
- turn-player / non-turn-player ordering
- rule processing

## What generation must never do

- do not delete existing authored blocks because metadata is incomplete
- do not invent DSL automatically from metadata alone
- do not create special-handler implementation files automatically
- do not use backend runtime modules as the skill runtime
