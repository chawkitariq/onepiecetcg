# Project Context

## Repository scope

This skill is tailored to `/home/verbq/Documents/dev/onepiecetcg`.
The backend lives in `packages/api/` and consumes authored effect-definition source files at runtime.

Before changing effect behavior, read:

- `docs/spec.md`
- `docs/rule_comprehensive.md`
- `docs/optcg-rules.md`

## Skill-owned tooling

The execution layer for this skill lives in the skill folder itself:

- `scripts/generate_effect_definitions.py`
  Load card metadata, preserve already-authored card blocks, generate placeholder blocks for uncovered cards, rewrite edition files, rewrite aggregate indexes, then validate.
- `scripts/validate_effect_definitions.py`
  Parse authored `*.effects.ts` and `*.special.ts` files directly and report structural problems.
- `scripts/effect_skill_lib.py`
  Shared metadata normalization, file parsing, rendering, and validation helpers.
- `scripts/run-generate-effects.sh`
  Thin shell wrapper around the Python generator.
- `scripts/run-validate-effects.sh`
  Thin shell wrapper around the Python validator.

These scripts intentionally avoid importing or invoking backend CLI implementation under `packages/api/src/`.

## Project files this skill reads or writes

- `packages/api/src/card-effect/definitions/`
  One edition file per set or product line.
- `packages/api/src/card-effect/definitions/index.ts`
  Aggregate edition export list.
- `packages/api/src/card-effect/definitions/special/`
  Imperative special handlers for outlier cards.
- `packages/api/src/card-effect/definitions/special/index.ts`
  Aggregate special-handler export list.

## What this skill is responsible for

This skill is responsible for:

1. finding card metadata
2. selecting which cards need an effect-definition entry
3. generating edition file scaffolds in the correct folder
4. preserving existing authored entries
5. validating the resulting definition set

This skill is not responsible for:

- booting the backend CLI
- resolving effects at runtime
- inventing missing card facts
- replacing `docs/rule_comprehensive.md` with a summary
