# @onepiecetcg/web

Nuxt 4 frontend for the One Piece TCG Simulator. This package is a **pure client**: it holds no authority logic. Authentication, deck validation, game rules, and all state-of-record live in [`packages/api`](../api/README.md) (NestJS). This package only renders UI, calls the API, and connects to the realtime Colyseus server.

## Requirements

- Node.js 22
- pnpm
- The [API](../api/README.md) running locally (this app calls it for auth, decks, and the card catalogue, and connects to it over WebSocket for realtime matches)

## Quickstart

Start the API first (see [packages/api/README.md](../api/README.md#quickstart)), then from `packages/web/`:

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser — Nuxt's dev server binds here by default; if the API is already using port 3000, Nuxt falls back to the next free port (typically 3001).

You should see the home page. In local `development`, sign in from `/login` with the anonymous shortcut, or configure Google/Discord credentials in the API `.env` if you want to test those OAuth flows too (see [packages/api/README.md](../api/README.md#authentication)).

## Environment variables

Copy `.env.example` to `.env` if you need to override the defaults:

| Variable | Default | Purpose |
| --- | --- | --- |
| `NUXT_PUBLIC_API_BASE` | `http://localhost:3000` | Base URL of the NestJS API. |
| `NUXT_PUBLIC_COLYSEUS_ENDPOINT` | `ws://localhost:3000` | WebSocket endpoint for the realtime duel room. |

## Commands

Run from `packages/web/`, or from the repo root with `pnpm --dir packages/web <script>`:

```bash
pnpm dev              # start Nuxt dev server
pnpm build            # production build
pnpm preview          # preview a production build locally
pnpm lint             # ESLint (Nuxt ESLint module)
pnpm typecheck        # nuxt typecheck (vue-tsc)
pnpm test             # vitest (watch mode)
pnpm test:run         # vitest (single run)
```

Run a single test file: `pnpm exec vitest run app/composables/useDuelRoom.spec.ts`.

CI runs `pnpm install`, `pnpm run lint`, and `pnpm run typecheck` — there's no test step wired into CI yet, so run tests locally before submitting changes.

## Architecture

### App structure (Nuxt 4 `app/` directory convention)

- `app/pages/` — file-based routes: `index.vue` (home), `login.vue`, `decks.vue` (deck builder with the integrated card catalogue — there's no separate `/catalogue` route), `lobby.vue` (matchmaking/lobby, at `/lobby`), `zone/[roomId].vue` (live game board, at `/zone/:roomId`).
- `app/components/` — Vue components. `PlayZone.vue`/`DuelBoard.vue` render the game board; `UserAccountMenu.vue` and `AppConfirmDialog.vue` are shared chrome.
- `app/layouts/` — `default.vue` and `lobby.vue` share the branded header and footer chrome; `simulator.vue` is a minimal layout for the live game board.
- `app/middleware/` — route middleware, e.g. `auth.ts` for auth-gated routes.
- `app/composables/` — the integration layer with the backend (see below).
- `app/app.vue` — thin root shell (`UApp` → `NuxtLayout` → `NuxtPage`). UI copy is in French (`lang="fr"`) — keep new user-facing strings in French to match existing pages.

### Composables (integration layer)

- `useApi()` — a `$fetch` instance pre-configured with the API base URL and cookie forwarding. Always use this instead of raw `$fetch`/`fetch` so cookies and the base URL stay consistent between SSR and client.
- `useSession()` — wraps auth state (`profile`, `loading`, `errorMessage`), backed by `GET /me` and Better Auth's sign-in/sign-out endpoints.
- `useColyseus()` — client-only wrapper around `colyseus.js`; the sole channel for realtime game state.
- `useDuelRoom()` — game-board state built on top of `useColyseus()`.

### Shared types

Card, deck, and game-state types come from [`@onepiecetcg/shared`](../shared/README.md) rather than being redefined locally — it's the contract shared with the backend. Anything client-side that mirrors a server-authoritative check (e.g. deck validation) is a *preview* only; the API re-validates authoritatively.

## Styling and UI

Built on [Nuxt UI](https://ui.nuxt.com) (v4) and Tailwind CSS v4. Icons come from `@iconify-json/lucide` and `@iconify-json/simple-icons`.

## Testing

Vitest with `@nuxt/test-utils` and `@vue/test-utils`, using `happy-dom`. Test files follow `*.spec.ts`, colocated next to the code they test.

## Related documentation

- [Root README](../../README.md) — running the full stack together
- [packages/api/README.md](../api/README.md) — the backend this app depends on
- [docs/spec.md](../../docs/spec.md) — product scope, including the client/server authority boundary this package must not cross
