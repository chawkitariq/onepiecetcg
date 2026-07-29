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
   - Refine generated placeholders into authored effects in `packages/api/src/card-effect/definitions/`.
   - If you need to generate effects for multiple editions in one task, split the work by edition and use sub-agents so each edition can be generated and validated independently.
   - Keep the generated comment blocks that contain the card description/text in skeleton output; never delete those comments during refinement.
9. After generating a skeleton, implement the full DSL for every generated card entry in that edition before considering the work complete.
10. Add or update the smallest useful mix of tests for the authored effects touched in scope:
   - engine or rules tests for reusable runtime behavior
   - family tests for reusable effect patterns shared by multiple cards
   - card-specific tests for special handlers, ambiguous texts, or uniquely complex cards
   - regression tests for the most critical or frequently exercised cards
   Make the assertions match the card text itself: verify each meaningful clause the description expresses, including scope words such as "this character", optional wording such as "you may", quantity limits such as "up to", and ordering words such as "then" when present. Prefer `packages/api/src/card-effect/effect-engine.spec.ts` for reusable runtime behavior, edition-specific files such as `packages/api/src/card-effect/definitions/op01.effects.spec.ts` for card-level effect coverage, and add loader tests when bootstrap behavior changes.
   Keep edition-specific test file names aligned with the edition definition file they cover: `op01.effects.ts` -> `op01.effects.spec.ts`, `op02.effects.ts` -> `op02.effects.spec.ts`, and so on.
11. Run a validation loop:
   - run validation
   - fix every reported issue
   - fill every remaining placeholder card without a real DSL
   - add or refine missing tests until the touched behavior is covered at the right layer and demonstrably matches the authored card text
   - rerun validation
   - repeat until validation passes, the generated edition has no unfinished generated placeholders left, and every touched effect has focused tests
   - When multiple editions are in scope, run this loop per edition rather than mixing their outputs in a single pass.
12. Keep changes declarative by default. Only use `definitions/special/` when a card cannot be represented safely or clearly by the DSL.
13. After the validation loop is clean, run the most focused repo checks that cover the touched area.

## Working Rules

- Treat `docs/spec.md` as the product source of truth.
- Treat `docs/rule_comprehensive.md` as the complete gameplay source of truth, and use `docs/optcg-rules.md` only as a condensed helper.
- Execute generation and validation through the skill's bundled scripts. Do not rely on backend `src/` CLI files as the skill runtime.
- Load cards from metadata first, then derive effect definitions from that metadata and the rules documents. Do not invent card facts that are absent from the metadata source.
- Preserve authored definitions whenever generation runs. The bundled generator is designed to merge deterministic placeholder output with existing entries, not wipe human-authored work.
- Preserve the generated skeleton comments that show the card description/text; do not remove them when editing generated files.
- Do not stop after skeleton generation. Finish by implementing the DSL for every generated card in scope, then loop on validation until there are no structural errors and no unfinished generated placeholders.
- Every touched effect must ship with meaningful coverage, but not every card needs an immediate one-test-per-card policy.
- Prefer a pragmatic test pyramid:
  - engine tests for rules or effect-runtime behavior
  - reusable family tests when several cards share the same authored pattern
  - card-specific suites when the effect is unique, complex, ambiguous, handled specially, or especially important in practice
  - regression tests for critical cards that should stay protected over time
- Test the complete effect path whenever you add card-level coverage: trigger, optional confirmation, costs, target choice, modifier application, moved cards, and the final authoritative state.
- Use the card text as an assertion checklist. Tests should prove that what happens in engine terms is what the description actually says should happen, rather than only proving that some internal helper was called.
- When a card text contains multiple clauses or constraints, add assertions for each meaningful part that affects gameplay semantics, especially actor ownership, eligible targets, timing, optionality, quantity bounds, and ordered "do X, then Y" resolution.
- If one effect definition expands into multiple authored effect blocks, add enough assertions at the right layer to prove the whole card behavior, not just one fragment.
- Add a dedicated per-card suite when the card uses a `special-ref`, when the effect shape is uniquely complex, when several sensitive rules are mixed together, or when the card is important enough that a regression would be costly.
- When you create or extend edition-specific effect tests, name the spec file after the edition file it covers by inserting `.spec` before `.ts`.
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
