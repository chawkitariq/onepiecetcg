# Effect Handler Audit

Audit date: 2026-07-29

This audit reviews every currently registered special handler in
`packages/api/src/card-effect/definitions/special/index.ts` and classifies it
into one of three buckets:

- `Converted to declarative DSL`
- `Still special, but concept looks reusable`
- `Still special, card-specific or not yet safely generalizable`

The goal is to keep `special/` limited to handlers that still need imperative
sequencing, cross-step state, or unsupported decision flow.

## Converted To Declarative DSL

These handlers were removed from the special registry because the behavior can
now be expressed with reusable primitives.

### OP05

- `OP05-011 Bartholomew Kuma`
  Reason: multicolor leader gate is now handled by
  `playerHasLeaderColorsAtLeast`.

- `OP05-016 Morley`
  Reason: both the `7000+ power` gate and the `multicolored leader` gate are
  now declarative via `sourcePowerAtLeast` and
  `playerHasLeaderColorsAtLeast`.

- `OP05-017 Lindbergh`
  Reason: same as Morley; both branches map cleanly once those two conditions
  exist.

- `OP05-059 Let Us Begin the World of Violence!!`
  Reason: both branches only needed the multicolor leader condition.

- `OP05-069 Trafalgar Law`
  Reason: the dynamic DON!! comparison is now declarative through
  `playerHasMoreTotalDonThan`.

- `OP05-071 Bepo`
  Reason: same dynamic DON!! comparison as Trafalgar Law.

- `OP05-102 Gedatsu`
  Reason: the dynamic KO cap now uses `costMaxFromLifeOf`.

- `OP05-116 Hino Bird Zap`
  Reason: the dynamic KO cap now uses `costMaxFromLifeOf`, and the trigger
  branch can call the main branch through `activateEffect`.

## Still Special, But Concept Looks Reusable

These handlers still exist because the current DSL cannot express them cleanly,
but the missing shape looks generic enough that it could justify a future
primitive if more cards need it.

- `OP04-040`
  Missing primitive: count-based condition spanning multiple zones
  (`life + hand <= 4`).
  Why still special: current conditions can count one selector at a time, but
  not a summed zone total.

- `OP04-048`
  Missing primitive: actions based on the number of cards moved by an earlier
  action, or a reusable "return all matching cards, then draw the same count".
  Why still special: the card returns the whole hand, shuffles, then redraws an
  equal number.

- `OP04-116`
  Missing primitive: condition on total life across both players.
  Why still special: the counter branch is otherwise declarative, but the total
  life threshold is not yet modeled directly.

- `OP05-002 Belo Betty`
  Missing primitive: union selector/filter logic such as
  `"Revolutionary Army" OR has [Trigger]`.
  Why still special: the targeting rule is generic, but current filters are
  conjunction-only.

- `OP05-043 Ulti`
  Missing primitive: "look at top N, take up to one, then manually reorder the
  remaining unrevealed window".
  Why still special: `search` can move chosen cards and bottom the rest, but it
  cannot preserve a player-driven order for the remainder.

- `OP05-058 It's a Waste of Human Life!!`
  Missing primitive: dynamic discard-down-to-size flow.
  Why still special: both players must discard exactly enough cards to reach
  five, one player after the other.

- `OP05-060 Monkey.D.Luffy`
  Missing primitive: disjunctive condition (`0 or 3+ DON!! on field`) or a
  general `conditionsAny` form.
  Why still special: the effect body itself is declarative once the condition
  exists.

- `OP05-099 Amazon`
  Missing primitive: branch selection by the opponent inside another player's
  effect.
  Why still special: the card asks the defending opponent whether to take Life
  trash or allow the fallback debuff branch.

## Still Special, Card-Specific Or Not Yet Safely Generalizable

These handlers depend on sequencing or interaction shapes that are still too
specific to turn into a narrow reusable primitive without more evidence.

- `OP04-047`
  Why still special: it depends on the current combat target and schedules a
  post-battle move for exactly that target. A reusable abstraction would likely
  need combat-target-aware selectors or event payloads, which is broader than
  this single card.

- `OP05-007 Sabo`
  Why still special: target legality depends on the sum of power across a
  multi-card selection. That aggregate constraint is generic in theory, but we
  do not yet have enough repeated demand to justify a compact primitive.

- `OP05-019 Fire Fist`
  Why still special: the second branch depends on game state mutated earlier in
  the same resolution. This likely needs a reusable "then if now true" or
  post-action conditional primitive rather than a one-card workaround.

- `OP05-114 El Thor`
  Why still special: the counter branch must apply both bonuses to the same
  chosen target, not just any valid target. The trigger branch is now
  declarative in spirit, but splitting the card only partly reduces the special
  logic, so it stays grouped for now.

- `OP05-119 Monkey.D.Luffy`
  Why still special: the card grants an extra turn, which is a structural game
  engine concern rather than a plain effect action.

## Current Registry Outcome

After this pass, the active special registry should contain only:

- `OP04-040`
- `OP04-047`
- `OP04-048`
- `OP04-116`
- `OP05-002`
- `OP05-007`
- `OP05-019`
- `OP05-043`
- `OP05-058`
- `OP05-060`
- `OP05-099`
- `OP05-114`
- `OP05-119`

That list reflects the current boundary between reusable DSL support and truly
imperative handling in this repository.
