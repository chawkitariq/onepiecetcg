---
name: onepiecetcg-effect-generation
description: Generate and validate One Piece TCG effect definitions for this repository from card metadata. Use when working on `packages/api/src/card-effect/definitions/`, when deciding where card metadata comes from, how edition `*.effects.ts` files must be generated, how special handlers are referenced, how naming conventions work, or how effect-definition files must be validated before use.
---

# OPTCG Effect Generation

Generate and validate the effect-definition files used by this repository's backend.

## Workflow

1. Read `references/project-context.md` to locate the target folders and understand what the skill owns.
2. Read `references/card-metadata-sources.md` to determine where card metadata must come from and which fields matter.
3. Read `references/effect-generation-rules.md` to understand exactly how metadata becomes edition `*.effects.ts` files.
4. Read `references/type-and-code-map.md` when you need the exact source files for DSL types, runtime loader behavior, registry contracts, or special-handler code.
5. Read `references/file-conventions.md` before creating or editing any file so naming and placement stay consistent.
6. Read `references/validation-rules.md` before validating or fixing a generated file set.
7. Read `docs/rule_comprehensive.md` before deciding what any effect should do. Treat it as the complete gameplay rules source of truth.
8. Pick the task path:
   - Validate existing definitions: run `scripts/run-validate-effects.sh`.
   - Generate from live card metadata: run `scripts/run-generate-effects.sh --edition OP01`.
   - Generate from a local metadata snapshot: run `scripts/run-generate-effects.sh --edition OP01 --source-file /abs/path/cards.json`.
   - Refine generated placeholders into authored effects in `packages/api/src/card-effect/definitions/`, then validate again.
9. Keep changes declarative by default. Only use `definitions/special/` when a card cannot be represented safely or clearly by the DSL.
10. After every change, rerun validation and then run the most focused repo checks that cover the touched area.

## Working Rules

- Treat `docs/spec.md` as the product source of truth.
- Treat `docs/rule_comprehensive.md` as the complete gameplay source of truth, and use `docs/optcg-rules.md` only as a condensed helper.
- Execute generation and validation through the skill's bundled scripts. Do not rely on backend `src/` CLI files as the skill runtime.
- Load cards from metadata first, then derive effect definitions from that metadata and the rules documents. Do not invent card facts that are absent from the metadata source.
- Preserve authored definitions whenever generation runs. The bundled generator is designed to merge deterministic placeholder output with existing entries, not wipe human-authored work.
- Prefer `--source-file` when upstream OPTCG API data is unavailable or when deterministic reproduction matters.
- Keep special handlers rare and card-specific. If multiple cards can share the same new behavior, improve the DSL instead of multiplying imperative handlers.

## Resources

- `references/project-context.md`
- `references/card-metadata-sources.md`
- `references/effect-generation-rules.md`
- `references/type-and-code-map.md`
- `references/file-conventions.md`
- `references/validation-rules.md`
- `scripts/run-generate-effects.sh`
- `scripts/run-validate-effects.sh`
