# One Piece TCG Simulator

A multiplayer online simulator for the One Piece Trading Card Game: build decks, queue into real-time matches, and play against another player with server-enforced game structure and hidden information.

## What it does

Two players can create accounts, build and save decks from the full card catalogue, and play a real-time match. The server (NestJS + Colyseus) is the sole authority on game structure — zones, phases, turn order, targeting, and hidden information (opponent's hand and life cards stay hidden). Card effect *text* is never interpreted automatically: players apply effects manually and honestly, the same trust model used by tabletop-simulator tools like Cockatrice. See [docs/spec.md](docs/spec.md) for the full product scope and [docs/optcg-rules.md](docs/optcg-rules.md) for the gameplay rules this implements.

## Who it's for

- **Contributors** working on the simulator itself — this README and the package READMEs below are your starting point.
- **Players**, once deployed, use the Nuxt web app directly; there's no separate client to install.

## Project structure

This is a pnpm workspace with app and package workspaces:

```text
apps/
  api/     # NestJS backend — sole source of authority (auth, REST API, realtime duel room)
  web/     # Nuxt 4 frontend — pure client, no authority logic
packages/
  shared/  # Types and validation shared between api and web
  cards/   # Catalog snapshots and loaders
  duel-engine/
  effect-engine/
docs/      # Product spec, OPTCG gameplay rules, delivery plan
```

Each package has its own README with commands and architecture notes:

- [apps/api/README.md](apps/api/README.md) — NestJS backend
- [apps/web/README.md](apps/web/README.md) — Nuxt frontend
- [packages/shared/README.md](packages/shared/README.md) — shared types package

## Requirements

- Node.js 22
- pnpm (version pinned via `devEngines` in [package.json](package.json); pnpm auto-installs a matching version if missing)
- Docker (for the local Postgres database), or a Postgres 18 instance you provide yourself

## Quickstart

Start Postgres:

```bash
docker compose up -d
```

Start the full local production stack (Postgres + API + Nuxt preview):

```bash
docker compose -f docker-compose.prod-local.yml up --build
```

Install dependencies (this also builds `packages/shared` via its `postinstall` script):

```bash
pnpm install
```

Copy the environment file and fill in local values:

```bash
cp apps/api/.env.example apps/api/.env
```

The defaults match `docker-compose.yml` for Postgres. In local `development`, you can use anonymous auth for testing without OAuth credentials; add Google and/or Discord OAuth credentials only if you want to test those flows too (see [apps/api/README.md](apps/api/README.md)).

Start every package at once — `shared` (build, then watch), `api`, and `web`, in the right order:

```bash
pnpm dev
```

Once running:

- Web app: [http://localhost:3001](http://localhost:3001)
- API: [http://localhost:3000](http://localhost:3000)

Sign in locally from `/login` with the anonymous development shortcut, or configure Google/Discord OAuth credentials in `apps/api/.env` if you want to test those flows too (see [apps/api/README.md](apps/api/README.md#authentication)).

## Common workflows

### Run a single package

Each workspace can also run on its own, e.g. `pnpm --dir apps/api start:dev`. See the package READMEs for the full command list.

### Lint and typecheck

```bash
pnpm --dir apps/api lint
pnpm --dir apps/api typecheck
pnpm --dir apps/web lint
pnpm --dir apps/web typecheck
```

These are the checks CI runs — there's no repo-wide `pnpm build`; the packages document why in their own READMEs.

### Run tests

```bash
pnpm --dir apps/api test        # unit tests
pnpm --dir apps/api test:e2e    # end-to-end tests
pnpm --dir apps/web test:run    # unit tests
```

## Contributing

Read [AGENTS.md](AGENTS.md) for repository conventions (commit style, coding conventions, and the rule that changes touching game logic or product scope must stay consistent with `docs/spec.md` and `docs/optcg-rules.md`).

## License

ISC — see [package.json](package.json).
