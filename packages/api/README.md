# @onepiecetcg/api

NestJS backend for the One Piece TCG Simulator. This package is the **sole source of authority**: OAuth authentication, account and deck persistence, the card catalogue, and the realtime duel room all live here. The [Nuxt web client](../web/README.md) is never trusted to enforce anything this package is responsible for.

## Requirements

- Node.js 22
- pnpm
- A running PostgreSQL 18 instance (the repo root [docker-compose.yml](../../docker-compose.yml) provides one)

## Quickstart

From the repo root, start Postgres and install dependencies once (see [the root README](../../README.md#quickstart)). Then, from `packages/api/`:

```bash
cp .env.example .env
pnpm start:dev
```

The API starts on [http://localhost:3000](http://localhost:3000). `pnpm start:dev` runs Nest in watch mode, restarting on file changes.

Verify it's running:

```bash
curl http://localhost:3000
```

You should get a plain `Hello World!` response.

## Environment variables

Copy `.env.example` to `.env` and adjust as needed. Defaults match the root `docker-compose.yml` Postgres service.

| Variable | Purpose |
| --- | --- |
| `API_PORT` | Port the API listens on (default `3000`). |
| `WEB_ORIGIN` | Origin of the Nuxt client, for CORS. |
| `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_USER`, `DATABASE_PASSWORD`, `DATABASE_NAME` | Postgres connection. |
| `DATABASE_URL` | Optional: a single connection string that overrides the `DATABASE_*` fields above. |
| `BETTER_AUTH_SECRET` | Better Auth signing secret. Change this for anything beyond local development. |
| `BETTER_AUTH_URL` | Base URL Better Auth uses for callbacks. |
| `SESSION_COOKIE_DOMAIN`, `SESSION_COOKIE_SECURE`, `SESSION_COOKIE_SAME_SITE` | Session cookie behavior; matters most for cross-domain cookies between `api` and `web` in production. |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET` | OAuth provider credentials. Optional in local development if you only use anonymous auth; required for the provider(s) you want to test. |

## Authentication

Production sign-in is OAuth-only (Google and Discord), handled by [Better Auth](https://better-auth.com) mounted inside NestJS via the community package `@thallesp/nestjs-better-auth`.

Local development also enables Better Auth's anonymous plugin when `NODE_ENV=development`, so contributors can sign in without configuring OAuth. This path is fail-closed: any other `NODE_ENV` value disables anonymous auth, including production.

## Commands

Run from `packages/api/`, or from the repo root with `pnpm --dir packages/api <script>`:

```bash
pnpm start:dev          # start NestJS in watch mode
pnpm start:debug        # watch mode with --inspect-brk debugger attached
pnpm start:prod         # run the built app (node dist/main)
pnpm lint               # eslint --fix over src/apps/libs/test
pnpm format             # prettier --write over src/ and test/
pnpm test               # jest unit tests (colocated *.spec.ts in src/)
pnpm test:watch         # jest --watch
pnpm test:cov           # jest --coverage
pnpm test:e2e           # jest -c test/jest-e2e.json (test/*.e2e-spec.ts)
```

Run a single unit test: `pnpm exec jest src/decks/decks.service.spec.ts`. Run a single e2e spec: `pnpm exec jest --config ./test/jest-e2e.json test/app.e2e-spec.ts`.

There's no `pnpm build` step documented here for local development — CI validates changes with `lint` and `typecheck`, not a production build.

## Architecture

### Module layout (`src/`)

- `app.module.ts` — composition root: wires `ConfigModule`, Better Auth, TypeORM, and the domain modules below. The global auth guard is disabled; routes opt into auth individually with `@UseGuards(AuthGuard)`.
- `accounts/` — maps an authenticated Better Auth user to a persisted `PlayerAccount`, exposes `GET /me`.
- `catalog/` — card catalogue: fetches and normalizes cards from the external [OPTCG API](https://optcgapi.com/api) into the shared `Card` schema, with a 12-hour in-memory cache.
- `decks/` — deck CRUD, server-side deck validation, and text import/export, scoped to the authenticated account.
- `realtime/` — Colyseus integration: the `duel` room (authoritative game state) and the service that attaches Colyseus onto Nest's underlying HTTP server.
- `auth/` — TypeORM entities for Better Auth's own tables. `src/auth.ts` (outside `auth/`) holds the Better Auth instance factory.
- `runtime-config.ts` — reads all environment variables in one place; use this instead of reading `process.env` directly elsewhere in the codebase.

### Realtime (Colyseus)

Colyseus has no official Nest integration. It's attached manually to Nest's raw HTTP server after `app.init()`, registering the `duel` room type. `DuelRoom` enforces the structural rules described in [docs/spec.md](../../docs/spec.md) §3: joining requires a validated deck, matches are capped at 2 clients, and a 120-second reconnection grace period absorbs temporary disconnects.

Card effect text is never interpreted server-side. Only structural fields (`cost`, `power`, `life`, `type`, `colors`) drive automated logic; anything requiring reading card text (Blocker, Counter, Triggers) stays a player-declared action the server records but doesn't validate.

### Database

`TypeOrmModule` runs with `synchronize: true`, so entities auto-migrate the schema in this environment — there are no manual migration files to run.

## Testing

Jest, configured inline in `package.json` (`rootDir: src`). Unit specs are colocated next to the code they test (e.g. `decks/decks.service.spec.ts`). End-to-end specs live in `test/` and run under `test/jest-e2e.json`. Shared deck/account fixtures live in `decks/shared-test.mock.ts` — reuse them instead of duplicating mock data.

## Related documentation

- [Root README](../../README.md) — running the full stack together
- [docs/spec.md](../../docs/spec.md) — product scope and MVP architecture (source of truth)
- [docs/optcg-rules.md](../../docs/optcg-rules.md) — One Piece TCG gameplay rules (source of truth)
