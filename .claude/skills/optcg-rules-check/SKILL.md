---
name: optcg-rules-check
description: Cross-check a proposed change against docs/spec.md, docs/optcg-rules.md, and docs/plan.md before implementing anything touching game logic, product scope, or delivery steps. Use before starting work on decks, catalog, realtime/duel room, matchmaking, or any gameplay-adjacent feature.
user-invocable: false
---

# OPTCG spec/rules/plan check

`CLAUDE.md` requires reading `docs/spec.md` and `docs/optcg-rules.md` before any change, and keeping `docs/plan.md` coherent with the spec. This skill is the enforcement step for that rule — run it before writing code for anything gameplay-adjacent, not just when explicitly asked.

## When to run this

Any task touching: `packages/api/src/realtime/` (duel room), `packages/api/src/decks/`, `packages/api/src/catalog/`, matchmaking/lobby, or any card/turn/combat logic in `packages/web`. Skip for pure infra, tooling, or non-gameplay UI work (styling, unrelated bug fixes).

## Steps

1. **Read all three docs** — they're short (spec.md ~154 lines, optcg-rules.md ~218 lines, plan.md ~335 lines). Reading them in full is cheap; skimming risks missing a scoping decision.
   - `docs/spec.md` — source of truth for product scope, MVP architecture, and feature *boundaries* (what's explicitly out of scope in §"Hors périmètre v1").
   - `docs/optcg-rules.md` — source of truth for actual OPTCG gameplay rules (turn structure, combat steps, keywords, zones).
   - `docs/plan.md` — the delivery plan broken into "Étapes"; each étape has backend/frontend/validation subsections.

2. **Locate the relevant section(s)** in each doc for the feature being touched, rather than assuming familiarity from a previous read — these docs evolve.

3. **Check three things before writing code:**
   - **Scope**: does `spec.md` §"Hors périmètre v1" explicitly exclude what's being asked? If so, flag it to the user before implementing rather than silently building out-of-scope work.
   - **Rules accuracy**: if the change automates or encodes a gameplay rule, does it match `optcg-rules.md`? Remember the project's core constraint (`spec.md` §3, restated in `packages/api/CLAUDE.md`): only *structural* card fields (`cost`, `power`, `life`, `type`, `colors`) may drive automated logic — card *text* effects (Blocker, Counter, Triggers, keyword abilities) must stay player-declared actions the server records but does not validate. A change that starts interpreting card text server-side violates this even if the specific rule is otherwise correct.
   - **Plan coherence**: does this change belong to a specific "Étape" in `plan.md`? If the change alters what that étape's backend/frontend/validation steps describe, update `plan.md` in the same work — don't let it drift silently.

4. **If a divergence is found** (scope creep, a rule implemented incorrectly, or `plan.md` no longer matching the spec), surface it to the user explicitly before proceeding — don't silently pick a resolution for a product-scope question.
