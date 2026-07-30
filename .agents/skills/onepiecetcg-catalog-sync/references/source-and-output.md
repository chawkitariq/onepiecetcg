# Source and Output Rules

## Source families

Use the OPTCG API families already documented in the repository:

- `/allSets/`
- `/allSetCards/`
- `/allSTCards/`
- `/allPromoCards/`
- `/allDonCards/`

## Card selection

- Keep cards that can be normalized into the shared schema.
- Skip entries that do not have a stable card number and name.
- Deduplicate repeated cards that appear in more than one source family.
- Treat promo and DON!! endpoints as complete mirrors: keep every card returned by the source endpoint and do not add or remove entries.

## Normalization

Map OPTCG fields onto shared fields using the same aliases as the repository catalog service.

Prefer these source fields when present:

- `card_set_id`, `card_id`, `id`, `card_number`, `number` -> `id` and `number`
- `card_name`, `name` -> `name`
- `card_type`, `type` -> `type`
- `card_color`, `colors`, `color` -> `colors`
- `card_cost`, `cost` -> `cost`
- `card_power`, `power` -> `power`
- `life`, `card_life` -> `life`
- `counter_amount`, `counter`, `card_counter` -> `counter`
- `attribute`, `attributes` -> `attributes`
- `sub_types`, `family`, `families`, `types` -> `families`
- `card_text`, `effect`, `text` -> `text`
- `trigger`, `card_trigger` -> `trigger`
- `card_image`, `image` -> `imageUrl`
- `set_id`, `set_name`, and related source aliases -> `set`
- `rarity` -> `rarity`

## Deterministic output

- Use a stable ordering inside each edition file.
- Keep the same edition grouping on every run.
- Write valid JSON only, with no wrapper object unless the downstream consumer explicitly expects one.
- Support filtering to one edition or several editions in the same run when the caller passes explicit edition ids such as `OP-01,EB-01`.
- Store each edition file in a folder named after its family prefix, such as `OP`, `EB`, or `ST`.
- Store promo cards in `packages/cards/catalog/PROMOS/PROMOS.json`.
- Store DON!! cards in `packages/cards/catalog/DON/DON.json`.

## Validation

- Validate every downloaded snapshot before reusing it.
- Check the top-level `editionId`, `name`, and `cards` structure.
- Ensure the parent folder matches the edition family prefix.
- Ensure each card keeps the shared schema shape and stays inside the edition file that owns it.
- Reject duplicate card ids, invalid card types, invalid colors, and malformed nested `set` objects.

## Handoff to effect generation

When you need effect-definition work, point `onepiecetcg-effect-generation` at the generated snapshot with `--source-file`.
