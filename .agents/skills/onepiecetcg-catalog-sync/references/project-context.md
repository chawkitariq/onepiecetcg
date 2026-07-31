# Project Context

This skill is tailored to `/home/verbq/Documents/dev/onepiecetcg`.

## Role in the repository

This skill owns the workflow that turns live OPTCG API data into local edition snapshots that can be reused by effect-generation work and by the standalone `@onepiecetcg/cards` workspace package.

The main consumers are:

- `onepiecetcg-effect-generation`, which can read a snapshot through `--source-file` instead of talking to the network.
- `@onepiecetcg/cards`, which loads, lists, and searches the packaged snapshots via `packages/cards/src/index.ts`.

## Intended snapshot layout

- One JSON file per edition.
- Filename equals the edition id, for example `OP-01.json`.
- Put each edition file in a folder named after the edition family prefix, for example `packages/cards/catalog/OP/OP-01.json` and `packages/cards/catalog/EB/EB-01.json`.
- File contents are a top-level object with `editionId`, `name`, and `cards`.
- Snapshot metadata includes both `editionId` and `name`, with the name sourced from `allSets`.
- Output should live under `packages/cards/catalog/` when that snapshot store is present in the repo.
- Promo snapshots live at `packages/cards/catalog/P/P.json` and should mirror `allPromoCards` exactly.
- DON!! snapshots live at `packages/cards/catalog/DON/DON.json` and should mirror `allDonCards` exactly.

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
- direct loading through `@onepiecetcg/cards`

## Package-level expectations

`packages/cards` is a lightweight workspace package, not just a data folder.

- `packages/cards/src/index.ts` is the public API surface.
- The package exports helpers such as `listCatalogEditions`, `loadCatalogEdition`, `loadCatalogCards`, `getCatalogCard`, and `searchCatalogCards`.
- The package tests live in `packages/cards/src/index.spec.ts`.
- The package test command is `pnpm --dir packages/cards test:run`.
- The package typecheck command is `pnpm --dir packages/cards exec tsc -p tsconfig.json --noEmit`.

If a catalog change affects file discovery, top-level snapshot shape, or card normalization guarantees, validate those package-level contracts too.
