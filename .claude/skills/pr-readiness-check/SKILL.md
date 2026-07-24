---
name: pr-readiness-check
description: Walk the current branch's changes against this repo's PR checklist (commit convention, commands run, linked specs, screenshots, untested areas) before opening a pull request. Invoke explicitly with /pr-readiness-check when you think a change is ready to submit.
disable-model-invocation: true
---

# PR readiness check

Run this before opening a PR, to check the diff against `CLAUDE.md`'s "Commit & Pull Request Guidelines" and the testing/documentation rules elsewhere in `CLAUDE.md` and the package-level `CLAUDE.md` files. This is a deliberate, user-invoked gate — not something to run silently mid-task.

## Steps

1. **Diff scope**: `git log --oneline main..HEAD` and `git diff main...HEAD --stat` to see what's actually changing and which packages are touched.

2. **Commit hygiene**: check commit messages follow angular convention (`type(scope): subject`) and are scoped to the package(s) actually touched (`api`, `web`, `shared`, or combinations). Flag commits that mix unrelated packages without a scope reflecting that, or that don't follow the convention.

3. **Commands run**: confirm, for each touched package, that `lint`, `typecheck`, and `test` (or `test:e2e` for new endpoints/realtime flows) have actually been run — don't assume; run them now if unclear:
   ```bash
   pnpm --dir packages/<pkg> lint
   pnpm --dir packages/<pkg> typecheck
   pnpm --dir packages/<pkg> test:run   # web/shared use test:run; api uses test
   ```
   Per root `CLAUDE.md`, never run the `build` scripts as part of this check.

4. **Test coverage**: for each new/changed controller, service, endpoint, component, or realtime flow in the diff, confirm a corresponding `*.spec.ts` exists and was added/updated in the same diff. New API endpoints or realtime flows not adequately covered by unit tests need e2e coverage too (`packages/api/test/*.e2e-spec.ts`).

5. **Spec/rules coherence**: if the diff touches gameplay logic, decks, catalog, or matchmaking, invoke the `optcg-rules-check` skill (or manually re-check `docs/spec.md`, `docs/optcg-rules.md`, `docs/plan.md`) to confirm nothing drifted out of scope and `docs/plan.md` reflects the current state.

6. **Documentation**: confirm new exported functions/classes/methods in the diff have JSDoc, per root `CLAUDE.md`.

7. **Screenshots**: if the diff touches `packages/web/app/**` in a visually observable way, note that the PR description needs screenshots — this skill can't capture them, so remind the user to attach them manually.

8. **Untested areas**: identify anything in the diff that isn't covered by the test suite (e.g. a UI interaction not exercised by Vitest, a realtime edge case not covered by a Colyseus spec) and draft the "untested areas" note the PR description should carry, per `CLAUDE.md`'s explicit requirement to call these out.

## Output

Produce a short PR-readiness summary: pass/fail per checklist item above, with concrete file references for any gap. If everything is ready, say so plainly and offer to draft the PR title/body.
