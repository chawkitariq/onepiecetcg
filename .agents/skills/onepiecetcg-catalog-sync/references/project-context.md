# Project Context

This skill is tailored to `/home/verbq/Documents/dev/onepiecetcg`.

## Role in the repository

This skill owns the workflow that turns live OPTCG API data into local edition snapshots that can be reused by effect-generation work.

The main consumer is `onepiecetcg-effect-generation`, which can read a snapshot through `--source-file` instead of talking to the network.

## Intended snapshot layout

- One JSON file per edition.
- Filename equals the edition id, for example `OP01.json`.
- File contents are the normalized cards for that edition only.
- Output should live under `packages/cards/catalog/` when that snapshot store is present in the repo.

## Shared schema target

Normalize into `@onepiecetcg/shared` `Card` objects, not raw OPTCG API payloads.

Preserve:

- `id`
- `number`
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
- `imageUrl`
- `set`
- `rarity`

## Downstream use

The normalized edition JSON files should be suitable for:

- effect generation
- card metadata inspection
- offline fixtures or snapshots
- deterministic reproduction of a catalog import
