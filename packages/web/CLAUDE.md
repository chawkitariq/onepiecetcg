# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Package overview

`packages/web` is the Nuxt 4 frontend of the One Piece TCG simulator. It is a **pure client**: it holds no authority logic. Authentication, deck validation, game rules, and all state-of-record live in `packages/api` (NestJS). This package only renders UI, calls the API, and connects to the realtime Colyseus server. See `docs/spec.md` (source of truth for product scope) and `docs/optcg-rules.md` (source of truth for gameplay rules) before making changes that touch game logic or product scope — read them from the repo root.

## Commands

Run from `packages/web/`, or from the repo root with `pnpm --dir packages/web <script>`:

```bash
pnpm dev              # start Nuxt dev server (http://localhost:3000)
pnpm build            # production build
pnpm preview           # preview a production build locally
pnpm lint              # ESLint (Nuxt ESLint module)
pnpm typecheck         # nuxt typecheck (vue-tsc)
pnpm test              # vitest (watch mode)
pnpm test:run          # vitest (single run)
```

Run a single test file: `pnpm exec vitest run app/components/AppLogo.spec.ts`.

CI (`packages/web/.github/workflows/ci.yml`) runs `pnpm install`, `pnpm run lint`, and `pnpm run typecheck` — no test step is wired into CI yet, so run tests locally before submitting changes.

## Architecture

### App structure (Nuxt 4 `app/` directory convention)

- `app/pages/` — file-based routes: `index.vue` (home), `login.vue`, `decks.vue` (deck builder + integrated card catalogue, no separate `/catalogue` route per spec), `room.vue` (matchmaking/lobby), `zone.vue` (live game board), `spike.vue` (technical spike page).
- `app/components/` — Vue components (PascalCase filenames). `PlayZone.vue` renders the two-player board; `TemplateMenu.vue` and `AppLogo.vue` are shared chrome.
- `app/composables/` — the integration layer with the backend, see below.
- `app/app.vue` — root layout (`UApp` shell: header with auth-aware user menu, `NuxtPage`, footer). French UI copy (`lang="fr"`) — keep new user-facing strings in French to match existing pages.
- `app/assets/css/` — global CSS entrypoint registered in `nuxt.config.ts` (`css: ['~/assets/css/main.css']`).

### Composables (integration layer)

- `useApi()` — returns a `$fetch` instance pre-configured with `runtimeConfig.public.apiBase`, `credentials: 'include'`, and forwarded cookies (`useRequestHeaders(['cookie'])`). **Always** go through this composable for API calls instead of raw `$fetch`/`fetch`, so cookies and base URL stay consistent between SSR and client.
- `useSession()` — wraps auth state (`profile`, `loading`, `errorMessage`) using `useState` (SSR-safe shared state), backed by `GET /me` and Better Auth's social sign-in/sign-out endpoints (`/api/auth/sign-in/social`, `/api/auth/sign-out`) on the API. There is no local password/email flow — OAuth (Google, Discord) only, delegated entirely to the backend.
- `useColyseus()` — client-only (`import.meta.client` guarded) wrapper around `colyseus.js`, connecting to `runtimeConfig.public.colyseusEndpoint` and joining the `duel` room (`joinOrCreate('duel', options)`). This is the sole channel for realtime game state; do not add other websocket clients.

### Runtime config

`nuxt.config.ts` exposes two public runtime config values, both overridable via env vars:
- `NUXT_PUBLIC_API_BASE` (default `http://localhost:3000`) — NestJS API base URL.
- `NUXT_PUBLIC_COLYSEUS_ENDPOINT` (default `ws://localhost:3000`) — Colyseus websocket endpoint.

### Shared types

Card, deck, and game-state types (`Card`, `Deck`, `DeckValidation`, `PublicCard`/`PrivateCard`, `GamePhase`, `GameZone`, deck text import/export helpers, etc.) come from `@onepiecetcg/shared` (workspace package, `packages/shared/src/index.ts`). Prefer importing types/helpers from there over redefining local shapes that mirror API responses — it's the contract shared with the backend. Anything client-side that mirrors a server-authoritative check (e.g. deck validation) is a *preview* only; the API re-validates authoritatively and this package must never assume its own copy is sufficient.

### Client authority boundary

Per `docs/spec.md`, the server (NestJS + Colyseus) is the sole source of truth for game structure (zones, phases, turn order, targeting, hidden information) and for account/deck persistence. This package must never implement or duplicate authoritative logic (final deck validation, combat resolution, hidden-info gating) — only UI, optimistic previews, and rendering of server-pushed state.

## Styling and UI

Built on `@nuxt/ui` (v4) and Tailwind CSS v4. ESLint stylistic config in `nuxt.config.ts` enforces no trailing commas (`commaDangle: 'never'`) and 1tbs brace style. Icons come from `@iconify-json/lucide` and `@iconify-json/simple-icons` (`i-lucide-*`, `i-simple-icons-*` classes).

For Nuxt UI work, consult the AI-oriented documentation at `https://ui.nuxt.com/docs/getting-started/ai/llms-txt`. Start with `https://ui.nuxt.com/llms.txt` for component and pattern guidance; use `https://ui.nuxt.com/llms-full.txt` only when deeper implementation or migration detail is needed.

## Testing

Vitest with `@nuxt/test-utils` (`environment: 'nuxt'` in `vitest.config.ts`) and `@vue/test-utils`, using `happy-dom`. Test files follow `*.spec.ts` colocated next to the component (see `app/components/AppLogo.spec.ts`).
