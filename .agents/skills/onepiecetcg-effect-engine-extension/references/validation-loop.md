# Validation Loop

## Required Loop

Every engine extension must end with a validation loop, not just a code change.

1. Add or update focused tests for the new runtime capability.
2. Run the most focused card-effect tests first.
3. Update the blocked card definitions to use the new capability.
4. Retry the effect-definition generation or completion task that previously failed.
5. If another unsupported primitive appears, repeat the workflow from the start.

## Tests To Update

- `packages/api/src/card-effect/effect-engine.spec.ts`
  - add behavioral tests for new actions, conditions, decisions, or replacement behavior
- `packages/api/src/card-effect/effect-loader.spec.ts`
  - add bootstrap or registry tests if indexing/loader behavior changed

Good tests should prove:

- the new DSL shape compiles and loads
- the engine resolves the effect in the correct order
- optional or player-choice branches pause and resume correctly if relevant
- temporary modifiers or moved cards end in the correct zones/state

## Card-Definition Completion Loop

The point of this skill is to unblock full effect-definition authoring.

After the engine change:

1. return to the blocked edition file, such as `packages/api/src/card-effect/definitions/op01.effects.ts`
2. replace previously skipped cards with real `effects` entries where the new capability applies
3. keep special handlers only where still justified
4. rerun the targeted tests
5. continue until the blocked batch can be represented cleanly

## Rule Validation

Before finalizing support for any new effect behavior:

- reread the relevant passage in `docs/rule_comprehensive.md`
- cross-check `docs/optcg-rules.md` only as a condensed helper
- verify the implementation still matches `docs/spec.md` and the server-authoritative effect-engine architecture

## Done Criteria

Consider the extension complete only when all of the following are true:

- the missing effect shape has an explicit DSL or justified special-handler representation
- the runtime resolves it correctly
- tests cover the new behavior
- the previously blocked cards can now be authored or completed
- no placeholder workaround remains where the new reusable primitive should now be used
