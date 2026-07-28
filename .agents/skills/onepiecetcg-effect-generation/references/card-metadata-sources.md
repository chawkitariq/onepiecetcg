# Card Metadata Sources

## Purpose

Use this reference to determine where card metadata must come from before generating any effect definition.

## Supported metadata inputs

The skill supports two metadata sources:

1. live OPTCG API catalog
2. local JSON snapshot

The generator chooses between them like this:

- if `--source-file` is provided, read that local JSON file
- otherwise, fetch the live OPTCG API endpoints

## Live OPTCG API endpoints

The skill fetches these endpoint families directly:

- `https://optcgapi.com/api/allSetCards/`
- `https://optcgapi.com/api/allSTCards/`
- `https://optcgapi.com/api/allPromoCards/`
- `https://optcgapi.com/api/allDonCards/`

If the live catalog is unstable, use `--source-file`.

## Local snapshot format

The file passed to `--source-file` must be one of:

- a JSON array of card objects
- a JSON object containing a `cards` array

Examples:

```json
[
  {
    "id": "OP01-006",
    "name": "Otama",
    "type": "Character",
    "color": "Red",
    "cost": "1",
    "power": "0",
    "text": "[On Play] ...",
    "trigger": ""
  }
]
```

```json
{
  "cards": [
    {
      "id": "OP01-006",
      "name": "Otama",
      "type": "Character",
      "text": "[On Play] ..."
    }
  ]
}
```

## Normalized metadata fields

The skill normalizes cards into this internal shape:

- `card_id`
- `name`
- `card_type`
- `colors`
- `cost`
- `power`
- `life`
- `counter`
- `attributes`
- `families`
- `text`
- `trigger`

## Accepted upstream keys

The normalizer accepts multiple possible upstream keys:

- card id: `id`, `card_id`, `card_set_id`
- name: `name`, `card_name`
- type: `type`, `card_type`
- colors: `colors`, `color`
- attributes: `attribute`, `attributes`
- families: `family`, `families`
- text: `text`, `card_text`
- trigger: `trigger`

## Which cards need effect definitions

A card needs an effect-definition entry only if both rules hold:

1. its category is not `DON!!`
2. its normalized `text` or `trigger` is non-empty

Cards with no effect text and no trigger text do not need an entry in an edition `*.effects.ts` file.

## How metadata must be used

Use metadata for:

- identifying the target edition from `card_id`
- deciding whether the card needs an entry
- generating the comment banner above new placeholder blocks
- preserving exact card identity

Do not use metadata alone to invent final DSL semantics. Cross-check card text and gameplay behavior against:

- `docs/rule_comprehensive.md`
- existing authored cards in nearby edition files
