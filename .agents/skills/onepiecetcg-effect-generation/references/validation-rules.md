# Validation Rules

## Goal

Validate the effect-definition file set before it is consumed by the backend runtime.

## Validation entrypoint

Use:

```bash
python3 .agents/skills/onepiecetcg-effect-generation/scripts/validate_effect_definitions.py
```

Or:

```bash
./.agents/skills/onepiecetcg-effect-generation/scripts/run-validate-effects.sh
```

## What the validator reads

By default, the validator reads:

- `packages/api/src/card-effect/definitions/*.effects.ts`
- `packages/api/src/card-effect/definitions/special/*.special.ts`

It does not validate aggregate files directly:

- `definitions/index.ts`
- `definitions/special/index.ts`

## Validation invariants

The validator checks:

1. duplicate edition ids
2. duplicate card ids across all edition files
3. duplicate effect ids across all cards
4. duplicate special handler ids
5. missing special handlers referenced by `special-ref`
6. orphan special handlers not referenced by any card
7. special-handler card mismatches
8. card id / edition id mismatches

## Meaning of each failure

### `DUPLICATE_EDITION_ID`

Two edition files claim the same `editionId`.

### `CARD_ID_EDITION_MISMATCH`

A card block is stored in the wrong edition file.

Example:

- `OP01-006` inside `op02.effects.ts`

### `DUPLICATE_CARD_ID`

The same card appears in more than one edition file.

### `DUPLICATE_EFFECT_ID`

Two authored DSL effects share the same `id`.

Effect ids must be globally unique across all edition files.

### `DUPLICATE_SPECIAL_HANDLER_ID`

Two special handlers share the same id, or two cards reference the same special handler id improperly.

### `MISSING_SPECIAL_HANDLER`

A card uses `kind: 'special-ref'` but the referenced handler does not exist in `definitions/special/`.

### `ORPHAN_SPECIAL_HANDLER`

A special handler file exists but no card references it.

### `SPECIAL_HANDLER_CARD_MISMATCH`

The handler file declares one `cardId`, but a different card references it.

## Validation workflow

Use this sequence:

1. generate or edit edition files
2. ensure aggregate indexes are current
3. run the validator
4. fix every reported issue
5. rerun until validation passes cleanly

The file set is only ready when validation succeeds with zero reported issues.
