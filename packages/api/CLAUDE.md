# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Package overview

`packages/api` is the NestJS backend of the One Piece TCG simulator. It is the **sole source of authority**: OAuth authentication, account/deck persistence, the card catalogue, and the realtime duel room all live here. `packages/web` (Nuxt) is a pure client and must never be trusted to enforce anything this package is responsible for. See `docs/spec.md` (product scope / MVP architecture) and `docs/optcg-rules.md` (gameplay rules) at the repo root before changing anything touching game logic or product scope.

## Commands

Run from `packages/api/`, or from the repo root with `pnpm --dir packages/api <script>`:

```bash
pnpm start:dev          # start NestJS in watch mode
pnpm start:debug        # watch mode with --inspect-brk debugger attached
pnpm build              # nest build
pnpm start:prod         # run the built app (node dist/main)
pnpm lint               # eslint --fix over src/apps/libs/test
pnpm format             # prettier --write over src/ and test/
pnpm test               # jest unit tests (*.spec.ts, colocated in src/)
pnpm test:watch         # jest --watch
pnpm test:cov           # jest --coverage
pnpm test:debug         # jest --runInBand with node --inspect-brk
pnpm test:e2e           # jest -c test/jest-e2e.json (test/*.e2e-spec.ts)
```

Run a single unit test file: `pnpm exec jest src/decks/decks.service.spec.ts`. Run a single e2e spec: `pnpm exec jest --config ./test/jest-e2e.json test/app.e2e-spec.ts`.

Requires a running Postgres instance matching `.env` (`DATABASE_HOST`/`PORT`/`USER`/`PASSWORD`/`NAME`, or a single `DATABASE_URL`) — copy `.env.example` to `.env` and adjust as needed. `TypeOrmModule` is configured with `synchronize: true` (see `src/app.module.ts`), so entities auto-migrate the schema in this environment; there are no manual migration files.

## Architecture

### Module layout (`src/`)

- `app.module.ts` — composition root: wires `ConfigModule`, Better Auth (`AuthModule.forRoot`), TypeORM (`TypeOrmModule.forRoot`), and the domain modules below. `disableGlobalAuthGuard: true` — auth is opt-in per route via `@UseGuards(AuthGuard)`, not applied globally.
- `accounts/` — maps an authenticated Better Auth user to a persisted `PlayerAccount` (`findOrCreateForAuthUser`), exposes `GET /me`.
- `catalog/` — card catalogue: fetches and normalizes cards from the external OPTCG API (`https://optcgapi.com/api`) into the shared `Card` schema, with a 12h in-memory cache (`CatalogService`).
- `decks/` — deck CRUD, server-side deck validation, and text import/export, scoped to the authenticated account.
- `realtime/` — Colyseus integration: the `duel` room (authoritative game state) and `ColyseusService`, which attaches the Colyseus server onto Nest's underlying HTTP server (see below).
- `auth/` — TypeORM entities for Better Auth's own tables (`BetterAuthUser`, `BetterAuthAccount`, `BetterAuthSession`, `BetterAuthVerification`); `src/auth.ts` (note: outside `auth/`) holds `createAuth()`, the Better Auth instance factory.
- `spike/` — leftover technical-spike module (see `docs/spec.md` §0, "Spike technique") validating the Better Auth + Colyseus + Nest integration; not part of the product feature set.
- `dev-fixtures/` — dev-only module (`DevFixturesModule`) that seeds three fixed email/password test accounts (`DEV_FIXTURE_ACCOUNTS`) on startup, gated on `config.isDevelopment`; lets contributors sign in without configuring an OAuth provider locally.
- `runtime-config.ts` — single `getApiConfig()` reads all env vars with defaults; use this instead of reading `process.env` directly elsewhere.

### Better Auth integration

Mounted via the community package `@thallesp/nestjs-better-auth` (no official Nest integration exists). Two points that are easy to break:
- Nest's default body parser is disabled globally (`NestFactory.create(AppModule, { bodyParser: false })` in `main.ts`) so Better Auth can parse raw auth requests itself; `AuthModule.forRoot` configures its own body parser limits instead.
- Cross-domain session cookies between this API and the Nuxt web app are controlled by `SESSION_COOKIE_DOMAIN`/`SESSION_COOKIE_SAME_SITE`/`SESSION_COOKIE_SECURE` in `runtime-config.ts`, consumed in `auth.ts`'s `advanced.crossSubDomainCookies`/`defaultCookieAttributes`. Google and Discord OAuth providers are the only sign-in path in production. `emailAndPassword` is also enabled in `auth.ts`, but gated on `config.isDevelopment` (fail-closed) — it exists solely so contributors can sign in locally via the `dev-fixtures/` seeded accounts, not as a production auth method.

Protect routes with `@UseGuards(AuthGuard)` from `@thallesp/nestjs-better-auth`; the authenticated user is attached to `request.user` (see `AuthenticatedRequest` type pattern in `accounts.controller.ts`/`decks.controller.ts`).

### Realtime (Colyseus)

Colyseus is not officially integrated with Nest either. `ColyseusService.attach(httpServer)` is called manually from `main.ts` after `app.init()`, binding a `WebSocketTransport` onto Nest's raw HTTP server and registering room types (`duel`, `duel_spike`). The `DuelRoom` (`realtime/duel.room.ts`) needs `DecksService` outside of Nest's DI (Colyseus instantiates rooms itself), so it's wired through a module-level `configureDuelRoomServices()` call rather than constructor injection — don't try to `@Inject` into `DuelRoom`.

`DuelRoom` enforces the structural rules from `docs/spec.md` §3: joining requires a validated deck (`decksService.getValidatedGameDeck`), max 2 clients, reconnection grace period (`RECONNECTION_SECONDS = 120`). Card effect text is never interpreted server-side — only structural fields (`cost`, `power`, `life`, `type`, `colors`) drive automated logic; anything requiring reading card text (Blocker, Counter, Triggers) stays a player-declared action the server records but doesn't validate.

When changing turn/phase logic, combat resolution, zone limits, or DON!! handling in `duel.room.ts` or the shared duel schema, validate the behavior against `docs/optcg-rules.md`, `docs/rule_comprehensive.md`, and `docs/rule_manual/` (root `docs/`) — this file is where nearly all rule-sensitive logic lives, and past bugs here (e.g. the DON!! power bonus persisting past the giver's turn) were only caught by checking against the primary rules sources, not the condensed summary alone.

### Catalog normalization

`CatalogService` fetches four OPTCG API endpoint families in parallel (`allSetCards`, `allSTCards`, `allPromoCards`, `allDonCards`) via `Promise.allSettled`, so one failing family doesn't fail the whole catalogue — it falls back to serving the existing cache if all sources fail and only errors if there's neither fresh data nor a cache. `normalizeCard` maps OPTCG's inconsistent field names (`card_set_id`/`card_id`/`id`, `card_name`/`name`, etc., tried in order via `firstString`/`firstValue`) onto the stable `Card` shape from `@onepiecetcg/shared`. When extending catalogue parsing, add new source field aliases to the `firstString`/`firstValue` key lists rather than assuming a single canonical key exists in the upstream API.

### Shared types

Import card/deck/game-state types from `@onepiecetcg/shared` (workspace package, `packages/shared/src/index.ts`) rather than redefining them — it's the contract with `packages/web`. Validation logic that also exists in `shared` for client-side preview (e.g. deck text parsing) must still be re-validated authoritatively here; never trust a client-computed result.

## Coding style

ESLint (`eslint.config.mjs`) uses `typescript-eslint` `recommendedTypeChecked` plus `eslint-plugin-prettier`; Prettier config (`.prettierrc`) is single quotes + trailing commas everywhere. `@typescript-eslint/no-explicit-any` is off and `no-floating-promises`/`no-unsafe-argument` are warnings, not errors — don't tighten these repo-wide without discussion. Run `pnpm lint` (auto-fixes) before submitting changes.

## Testing

Jest, configured inline in `package.json` (`rootDir: src`, `testRegex: '.*\\.spec\\.ts$'`). Unit specs are colocated next to the code they test (e.g. `decks/decks.service.spec.ts`). E2E specs live in `test/` and run under `test/jest-e2e.json`. `decks/shared-test.mock.ts` holds shared deck/account fixtures for tests — reuse it instead of duplicating mock data.
