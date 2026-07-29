---
name: onepiecetcg-catalog-sync
description: Download OPTCG API card data into local edition JSON snapshots and normalize it to the shared One Piece TCG card schema. Use when refreshing `packages/cards/catalog/`, grouping all cards for an edition into a single file such as `OP01.json`, preparing deterministic `--source-file` inputs for `onepiecetcg-effect-generation`, or mapping OPTCG API fields onto `@onepiecetcg/shared` `Card` objects.
---

# OPTCG Catalog Sync

Download card metadata from the OPTCG API, normalize it to the shared card schema, and write one deterministic JSON snapshot per edition.

Use this skill when you need an offline catalog snapshot for effect generation, fixture generation, or local inspection of all cards in an edition.

## Workflow

1. Read `references/project-context.md` to confirm where catalog snapshots live and how they are consumed.
2. Read `references/source-and-output.md` to see which OPTCG API families to fetch, how to bucket cards by edition, and which shared fields must be preserved.
3. Use `scripts/run-download-catalog.sh` to fetch the source data from the OPTCG API or to replay a local snapshot.
4. Normalize each card to the `@onepiecetcg/shared` `Card` shape.
5. Group cards by edition and write one JSON file per edition, using the edition id as the filename, for example `OP01.json`.
6. Keep the output deterministic: stable ordering, stable ids, and no duplicate cards inside the same edition file.
7. When the snapshot is ready, pass it to `onepiecetcg-effect-generation` with `--source-file` if you need to generate or refresh effect definitions without hitting the network.

## Working Rules

- Keep the snapshot data authoritative for metadata only; do not invent gameplay text or effect behavior.
- Prefer the shared `Card` schema from `packages/shared` over ad hoc JSON shapes.
- Preserve upstream card identifiers and edition identifiers exactly as normalized by the catalog pipeline.
- Write all cards for the same edition into the same file.
- Use this skill as the bridge between live OPTCG API data and effect-generation workflows.

## Typical Triggers

- Build or refresh local OPTCG edition snapshots.
- Normalize OPTCG API responses into the shared `Card` type.
- Generate deterministic JSON inputs for `onepiecetcg-effect-generation`.
- Inspect or reconcile edition-level card data before authoring card effects.

## Resources

- `references/project-context.md`
- `references/source-and-output.md`
- `scripts/run-download-catalog.sh`
- `scripts/download_catalog_snapshots.py`
- `scripts/catalog_skill_lib.py`
