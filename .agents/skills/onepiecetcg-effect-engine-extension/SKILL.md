---
name: onepiecetcg-effect-engine-extension
description: Add support for new unsupported One Piece TCG card effects in this repository's reusable effect engine. Use when an effect definition cannot be expressed with the current DSL, when `packages/effect-engine/src/effect-engine.ts` lacks a required behavior, when new costs/targets/destinations/triggers/replacements must be modeled, or when deciding whether a card should use declarative DSL or a family-scoped special handler.
---

# OPTCG Effect Engine Extension

Extend the reusable card-effect engine so new card texts can be represented and resolved correctly.

Use this skill when effect-definition generation stops on an unsupported rule shape such as a new cost, a richer target selector, a counter-only behavior, a destination the engine cannot move to yet, or a card text that exposes a missing DSL primitive.

## Workflow

1. Read `references/project-context.md` to identify the exact runtime files, type files, and definition files involved.
2. Read `docs/rule_comprehensive.md` before designing support for a new effect. Treat it as the gameplay source of truth.
3. Read `references/engine-extension-decision-tree.md` to decide whether the gap belongs in the shared DSL, the engine runtime, a special handler, or a combination.
4. Read `references/extension-patterns.md` before editing any type or runtime file so the extension stays declarative and reusable.
5. Read `references/validation-loop.md` before testing so every engine change is proven by the right mix of runtime tests, reusable family tests, card-specific tests when justified, and a generation retry loop.
6. Implement the smallest reusable engine capability that unlocks the blocked cards.
7. Update or add the affected effect definitions in `packages/cards/src/effects/`.
8. Run the validation loop until the blocked cards can be authored cleanly and the targeted tests pass.

## Working Rules

- Prefer extending the declarative DSL when multiple cards can share the same new concept.
- When adding a new primitive could break, fragilize, or fail to improve engine reliability enough, choose the safest option for the current context and prefer a specialized handler if that keeps the engine more reliable.
- Audit existing handlers before adding new engine behavior and decide whether any of them should be converted into a reusable primitive or kept as special-case code based on the current context.
- Touch `packages/shared/src/effects.ts` first when the missing concept is part of authored card definitions.
- Touch `packages/effect-engine/src/effect-engine.ts` when the runtime cannot resolve an already-valid DSL concept.
- Keep `effects/<FAMILY>/special/` as the fallback for truly card-specific sequencing or temporary escape hatches, not as the default place for reusable mechanics.
- When a missing effect shape can recur across cards or sets, do not solve it only inside one special handler.
- Preserve the repository split:
  - `packages/shared/` owns the effect DSL contracts.
  - `packages/effect-engine/src/` owns loading, indexing, runtime resolution, and card-specific handlers.
  - `apps/api/src/duel/effects/` owns room and duel integration with the reusable engine.
- Always add or update the right test layer for every new engine capability:
  - `packages/effect-engine/src/effect-engine.spec.ts` for reusable runtime or rules behavior
  - `packages/effect-engine/src/effect-loader.spec.ts` when loader or registry wiring changes
  - edition-specific card suites such as `packages/cards/src/effects/OP/OP-01.effects.spec.ts` when the new capability unlocks a unique, ambiguous, special-handled, or especially critical card behavior
- After unlocking the runtime, return to the blocked effect definitions and finish the declarative DSL conversion instead of leaving placeholders behind.
- Do not default to one dedicated test per unlocked card if the behavior is already well protected by reusable engine or family coverage.
- Add a dedicated per-card suite when the card uses a special handler, when the effect is uniquely complex, when several sensitive rules are mixed together, or when the card is important enough that a regression deserves explicit protection.

## Typical Triggers

- A generated or authored card definition needs a new `EffectAction`, `EffectCondition`, `EffectTargetSelector`, trigger, or replacement event.
- `effect-engine.ts` cannot currently pay a cost, ask for a decision, resolve a destination, or apply a modifier required by a real card.
- An unsupported OP01 card is blocked by richer targeting, counter-phase logic, variable choice flow, or a new move/KO/reveal/search behavior.
- A special handler was added as a workaround, and you now want to replace it with reusable DSL support.

## Resources

- `references/project-context.md`
- `references/engine-extension-decision-tree.md`
- `references/extension-patterns.md`
- `references/validation-loop.md`
