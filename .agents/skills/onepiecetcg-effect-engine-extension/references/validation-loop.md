# Validation Loop

## Required Loop

Every engine extension must end with a validation loop, not just a code change.

1. Add or update tests at the appropriate layer for the new runtime capability.
2. Prefer reusable engine tests first when the behavior is generic.
3. Add reusable family tests when several cards share the same unlocked authored pattern.
4. Add card-specific tests only when the unlocked card behavior is unique, ambiguous, special-handled, or especially critical.
5. Run the most focused card-effect tests first.
6. Update the blocked card definitions to use the new capability.
7. Retry the effect-definition generation or completion task that previously failed.
8. If another unsupported primitive appears, repeat the workflow from the start.

## Tests To Update

- `packages/api/src/card-effect/effect-engine.spec.ts`
  - add behavioral tests for new actions, conditions, decisions, replacement behavior, or other reusable rules behavior
- `packages/api/src/card-effect/effect-loader.spec.ts`
  - add bootstrap or registry tests if indexing or loader behavior changed
- edition-specific specs such as `packages/api/src/card-effect/definitions/op01.effects.spec.ts`
  - add card-level tests when the unlocked card behavior needs dedicated protection

Good tests should prove:

- the new DSL shape compiles and loads
- the engine resolves the effect in the correct order
- optional or player-choice branches pause and resume correctly if relevant
- temporary modifiers or moved cards end in the correct zones/state
- the behavior is protected at the right layer instead of only by accidental incidental coverage
- the card text meaning is asserted explicitly when card-level tests are added

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
- tests cover the new behavior at the right layer
- the previously blocked cards can now be authored or completed
- no placeholder workaround remains where the new reusable primitive should now be used
