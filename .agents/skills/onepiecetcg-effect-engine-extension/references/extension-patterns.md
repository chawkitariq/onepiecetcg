# Extension Patterns

## 1. Extend The Shared DSL First

When a new authored concept is needed, update `packages/shared/src/effects.ts` first.

Typical extension points:

- `EffectCondition`
  - add a new guard used by `conditionsPass()` in `effect-engine.ts`
- `EffectCardFilter`
  - add new card-matching dimensions used by host selection or local filter checks
- `EffectTargetSelector`
  - add new selection semantics such as richer counts or zone scopes
- `EffectDecisionPrompt`
  - add new player decision types if current `confirm`, `selectCards`, or `selectChoice` are insufficient
- `EffectAction`
  - add a new runtime action when the card text introduces a reusable operation
- `ReplacementEffectDefinition['event']`
  - add a new replacement interception point only if the engine can actually ask that question at runtime

Keep new shapes narrow and composable. Avoid embedding card IDs or one-off card rules in shared types.

## 2. Mirror The DSL In The Runtime

After changing shared types, update the runtime interpreter in `packages/api/src/card-effect/effect-engine.ts`.

Main runtime touchpoints:

- `handleEvent()`
  - new trigger windows and queueing rules
- `applyReplacement()`
  - new replacement query types
- `resolveActions()`
  - execution logic for new `EffectAction` variants
- `conditionsPass()`
  - support for new `EffectCondition` variants
- selection helpers such as `forSelectedCards()` and `chooseCards()`
  - support for new decision or selector behavior
- modifier lifecycle helpers
  - support for new durations or cleanup semantics

If a new action needs host capabilities that do not exist yet, extend `EffectEngineHost` too and add matching host test doubles in `effect-engine.spec.ts`.

## 3. Keep Definitions Declarative

Once the engine supports the missing primitive:

1. Return to the relevant `packages/api/src/card-effect/definitions/*.effects.ts` file.
2. Replace placeholder entries or missing cards with real `effects` data.
3. Prefer `kind: 'standard'`, `kind: 'continuous'`, or `kind: 'replacement'`.
4. Use `kind: 'special-ref'` only when the card still cannot be expressed safely.

## 4. Special Handler Pattern

When a special handler is still justified:

- add a card-specific file in `packages/api/src/card-effect/definitions/special/`
- export a `SpecialHandlerDefinition`
- keep logic small and deterministic
- prefer queueing standard effects through `engine.queueEffect()` instead of mutating gameplay state directly
- register the handler in `definitions/special/index.ts`
- reference it from the card definition via `kind: 'special-ref'`

The handler in `packages/api/src/card-effect/definitions/special/op01-047.special.ts` is the baseline example.

## 5. Loader And Index Maintenance

Most engine extensions do not need loader changes, but check:

- `effect-loader.ts`
  - if a new authored entry kind or new registry invariant was introduced
- `effect-indexes.ts`
  - if a new trigger or replacement event type was introduced

If you add a new replacement event to shared types but forget `effect-indexes.ts`, bootstrap behavior will be incomplete.

## 6. Design For The Actual Blockers

The documented blocker was that complete OP01 DSL conversion stalled on unsupported costs, counter effects, and richer targeting/destination cases.

Treat those as reusable capability categories, not isolated cards:

- costs
  - add reusable cost actions or explicit cost-phase handling where possible
- counter effects
  - introduce runtime hooks only if they can support multiple real cards
- targeting and destinations
  - extend selectors and move semantics carefully so authored definitions stay readable

## 7. Keep The Surface Small

For each new primitive:

- name it generically
- document it through tests
- avoid introducing several overlapping action shapes at once
- prefer one well-scoped extension followed by definition updates, then repeat if another gap remains
