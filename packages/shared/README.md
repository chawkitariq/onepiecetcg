# @onepiecetcg/shared

Types, schemas, and helpers shared between [`packages/api`](../api/README.md) and [`packages/web`](../web/README.md) — the contract that keeps the backend and frontend from drifting apart.

## What belongs here

- The normalized card schema (`Card`, `CardType`, `CardColor`) and deck types (`Deck`, `DeckCard`, `DeckValidation`).
- Deck text import/export helpers (`parseDeckText`, `exportDeckToText`) for the `QUANTITYxCARD_ID` format.
- Colyseus duel-room state schemas (`duel-state-schema.ts`) and the client-facing view types (`DuelRoomView`, `DuelPlayerView`, `CombatStatus`, etc.).

## What doesn't belong here

Anything that must stay authoritative on the server — final deck validation, structural combat resolution — stays in `packages/api`. Code duplicated here for a client-side *preview* (e.g. deck validation before submitting to the API) is fine; trusting that preview as the source of truth on the server is not. See [docs/spec.md](../../docs/spec.md) §0 for the full rule.

## Consuming this package

`api` and `web` both depend on it as `@onepiecetcg/shared: workspace:*` and import from its built `dist/` output (see the `exports` map in [package.json](package.json)), not from `src/` directly. That means **editing `src/` alone doesn't reach consumers** — this package needs a build step in between.

- `pnpm install` at the repo root builds it once automatically (via `postinstall`).
- While developing, run `pnpm dev` in this package (or `pnpm dev` at the repo root, which does this for you) to rebuild on every change:

  ```bash
  pnpm dev
  ```

  This runs both the CommonJS and ESM `tsc --watch` builds in parallel.

## Commands

Run from `packages/shared/`, or from the repo root with `pnpm --dir packages/shared <script>`:

```bash
pnpm build       # one-off build (CJS + ESM)
pnpm dev         # watch mode, rebuilds both outputs on change
pnpm typecheck   # tsc --noEmit
pnpm test        # vitest (watch mode)
pnpm test:run    # vitest (single run)
```

## Related documentation

- [Root README](../../README.md) — running the full stack together
- [docs/spec.md](../../docs/spec.md) §0 — why this package exists and its boundaries
