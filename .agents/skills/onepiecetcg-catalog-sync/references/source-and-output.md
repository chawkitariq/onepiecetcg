# Source and Output Rules

## Source families

Use the OPTCG API families already documented in the repository:

- `/allSetCards/`
- `/allSTCards/`
- `/allPromoCards/`
- `/allDonCards/`

## Card selection

- Keep cards that can be normalized into the shared schema.
- Skip entries that do not have a stable card number and name.
- Deduplicate repeated cards that appear in more than one source family.

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

## Handoff to effect generation

When you need effect-definition work, point `onepiecetcg-effect-generation` at the generated snapshot with `--source-file`.
