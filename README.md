# One Piece TCG Simulator

A multiplayer online simulator for the One Piece Trading Card Game: build decks, queue into real-time matches, and play against another player with server-enforced game structure and hidden information.

## What it does

Two players can create accounts, build and save decks from the full card catalogue, and play a real-time match. The server (NestJS + Colyseus) is the sole authority on game structure — zones, phases, turn order, targeting, and hidden information (opponent's hand and life cards stay hidden). Card effect *text* is never interpreted automatically: players apply effects manually and honestly, the same trust model used by tabletop-simulator tools like Cockatrice. See [docs/spec.md](docs/spec.md) for the full product scope and [docs/optcg-rules.md](docs/optcg-rules.md) for the gameplay rules this implements.

## Who it's for

- **Contributors** working on the simulator itself — this README and the package READMEs below are your starting point.
- **Players**, once deployed, use the Nuxt web app directly; there's no separate client to install.

## Project structure

This is a pnpm workspace with three packages:

```text
packages/
  api/     # NestJS backend — sole source of authority (auth, REST API, realtime duel room)
  web/     # Nuxt 4 frontend — pure client, no authority logic
  shared/  # Types and validation shared between api and web
docs/      # Product spec, OPTCG gameplay rules, delivery plan
```

Each package has its own README with commands and architecture notes:

- [packages/api/README.md](packages/api/README.md) — NestJS backend
- [packages/web/README.md](packages/web/README.md) — Nuxt frontend
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

Install dependencies (this also builds `packages/shared` via its `postinstall` script):

```bash
pnpm install
```

Copy the environment file and fill in local values:

```bash
cp packages/api/.env.example packages/api/.env
```

The defaults match `docker-compose.yml` for Postgres. You still need to edit `.env` to add Google and/or Discord OAuth credentials before you can sign in (see [packages/api/README.md](packages/api/README.md)).

Start every package at once — `shared` (build, then watch), `api`, and `web`, in the right order:

```bash
pnpm dev
```

Once running:

- Web app: [http://localhost:3001](http://localhost:3001)
- API: [http://localhost:3000](http://localhost:3000)

Sign in locally from `/login` with Google or Discord after configuring the corresponding OAuth credentials in `packages/api/.env` (see [packages/api/README.md](packages/api/README.md#authentication)).

## Common workflows

### Run a single package

Each package can also run on its own, e.g. `pnpm --dir packages/api start:dev`. See the package READMEs for the full command list.

### Lint and typecheck

```bash
pnpm --dir packages/api lint
pnpm --dir packages/api typecheck
pnpm --dir packages/web lint
pnpm --dir packages/web typecheck
```

These are the checks CI runs — there's no repo-wide `pnpm build`; the packages document why in their own READMEs.

### Run tests

```bash
pnpm --dir packages/api test        # unit tests
pnpm --dir packages/api test:e2e    # end-to-end tests
pnpm --dir packages/web test:run    # unit tests
```

## Contributing

Read [AGENTS.md](AGENTS.md) for repository conventions (commit style, coding conventions, and the rule that changes touching game logic or product scope must stay consistent with `docs/spec.md` and `docs/optcg-rules.md`).

## License

ISC — see [package.json](package.json).
