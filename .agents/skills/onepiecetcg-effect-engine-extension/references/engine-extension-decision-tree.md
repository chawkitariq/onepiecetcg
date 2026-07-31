# Engine Extension Decision Tree

## Goal

When a card text cannot be authored cleanly, decide where the missing support belongs.

## 1. Confirm The Real Missing Capability

Before editing code:

1. Read the exact card metadata text that failed conversion.
2. Read `docs/rule_comprehensive.md` for the underlying rule behavior.
3. Classify the gap:
   - missing trigger window
   - missing condition
   - missing cost
   - missing target selector or count rule
   - missing action or destination
   - missing replacement event
   - missing decision flow
   - truly card-specific sequencing

Do not extend the engine before naming the missing primitive precisely.

## 2. Decide DSL vs Special Handler

Use the declarative DSL when:

- the same behavior can apply to multiple cards
- the missing concept is a reusable rule primitive
- the effect can still be described as triggers, conditions, costs, actions, and player decisions

Use a special handler when:

- the behavior is unique to one card or a tiny set of cards
- the sequencing depends on imperative branching that would bloat the DSL
- the runtime support is needed immediately for one edge case, but the reusable abstraction is not clear yet

If several blocked cards share the same limitation, prefer extending the DSL rather than multiplying special handlers.

## 3. Decide Shared-Type Change vs Effect-Engine-Only Change

Edit `packages/shared/src/effects.ts` when authored definitions need a new shape, such as:

- a new action type
- a new condition
- a new target-selector option
- a new decision prompt shape
- a new replacement event

Edit only `packages/effect-engine/src/` when:

- the shared DSL already expresses the concept
- the loader, indexes, or runtime just do not execute it correctly yet

## 4. Decide Which Effect-Engine Runtime File Changes

- `effect-engine.ts`
  - add action execution
  - add condition evaluation
  - add player-choice continuation logic
  - add replacement-query behavior
  - add modifier lifecycle handling
- `effect-loader.ts`
  - add bootstrap support for new authored entry behavior
- `effect-indexes.ts`
  - add new trigger or replacement indexing
- `types/effect-definition-source.ts`
  - add new source entry variants only if edition files need a new top-level authored entry kind
- `types/effect-registry.ts`
  - add runtime contract fields when bootstrap/runtime concepts become explicit

## 5. Counter, Cost, And Rich Targeting Heuristics

For gaps like the blocked OP01 cards mentioned in the original problem:

- Missing costs:
  - extend DSL if the cost is reusable such as DON!! return, hand trash, rest-self, or life-to-hand
  - keep card-specific cost choreography in a special handler only if the cost is tightly coupled to unique branching
- Counter-phase effects:
  - prefer adding reusable trigger/decision/action support if multiple counter events will need it
  - do not hardcode one event card unless the phase model itself is intentionally still simplified
- Richer targeting or destinations:
  - extend `EffectTargetSelector`, `EffectCardFilter`, or move/replacement action support if the same targeting rule can recur
  - if the target resolution depends on one card's bespoke ordering puzzle, a special handler is acceptable

## 6. Exit Criteria

The extension is complete only when:

- the missing primitive has a clear contract
- runtime support exists
- focused tests cover it
- blocked card definitions can now be authored without placeholder comments or ad-hoc duplication
