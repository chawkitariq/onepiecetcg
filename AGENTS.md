# Repository Guidelines

## Project Structure & Module Organization

This pnpm workspace has two application workspaces:

- `apps/web/` contains the Nuxt 4 frontend. See `apps/web/CLAUDE.md` for its architecture, commands, and conventions.
- `apps/api/` contains the NestJS backend. See `apps/api/CLAUDE.md` for its architecture, commands, and conventions.
- `packages/shared/` contains types and helpers shared between `api` and `web` (`packages/shared/src/index.ts`).
- `docs/` contains project notes, game rules, and product specs.

## Build, Test, and Development Commands

Install dependencies from the repository root:

```bash
pnpm install
```

Run package scripts with `--dir`, e.g. `pnpm --dir apps/api start:dev`. Backend commands are documented in `apps/api/CLAUDE.md`, frontend commands in `apps/web/CLAUDE.md`.

`packages/shared` is consumed via its built `dist/` output (see its `exports` map), not `src/` directly — `api`/`web` won't see edits to `packages/shared/src` until it rebuilds. Run `pnpm --dir packages/shared dev` alongside `api`/`web` dev servers to rebuild it on change instead of rerunning `pnpm --dir packages/shared build` manually, or just run `pnpm dev` from the repo root to start `shared` (build once, then watch), `api`, and `web` together via `concurrently`. `web` needs `api` bound to port 3000 first (Nuxt's dev server would otherwise race for the same port) — the root script waits on `tcp:3000` (`wait-on`) before starting `web`.

The root `pnpm test` script is a placeholder.

## Coding Style & Naming Conventions

Use TypeScript throughout. Follow Vue Composition API patterns in `apps/web/app/**/*.vue` and NestJS class-based patterns in `apps/api/src/**/*.ts`. Use PascalCase for Vue components and NestJS classes, camelCase for functions and variables, and kebab-case for route or asset filenames.

Backend linting uses ESLint, `typescript-eslint`, and Prettier (see `apps/api/CLAUDE.md`). Frontend linting is provided by Nuxt ESLint (see `apps/web/CLAUDE.md`). Prefer the package lint commands before submitting changes.

## Agent-Specific Instructions

### Specs & Documentation Sync

Before any change, addition, or update, read `docs/spec.md` and `docs/optcg-rules.md` to confirm the implementation still matches the product scope and One Piece TCG rules. Treat `docs/spec.md` as the source of truth for product specs, MVP architecture, and feature boundaries. Treat `docs/optcg-rules.md` as the source of truth for One Piece TCG gameplay rules and gameplay structure. Keep `docs/plan.md` coherent, non-divergent, and up to date with `docs/spec.md`; when the spec changes, update the plan in the same work if the implementation steps are affected.

Always cross-check actual gameplay behavior (not just docs) against `docs/rule_comprehensive.md` (the full official Comprehensive Rules) and `docs/rule_manual/` (the official Rule Manual, as page images) whenever touching turn/phase logic, combat resolution, zone limits, or DON!! handling — `docs/optcg-rules.md` is a condensed derivative of these two and can omit nuance (e.g. the DON!! power bonus applying "during your turn" only is explicit in both primary sources but easy to miss from the summary alone).

### Dependencies

Before adding any dependency, always ask the user for both permission and their opinion on the proposed dependency.

### Code Documentation

Always document exported functions, classes, and methods with JSDoc.

### Testing Requirements

Always add unit tests for new features and behavior changes, and add e2e tests when the change is not adequately covered by unit tests (e.g. new API endpoints or realtime flows). Backend and frontend testing conventions are documented in `apps/api/CLAUDE.md` and `apps/web/CLAUDE.md` respectively. Add focused tests for new controllers, services, components, and behavior changes, and always include non-regression tests for important features.

### Build

Never run the package `build` commands (`pnpm build` / `pnpm --dir <package> build`) — use `lint`, `typecheck`, and `test`/`test:e2e` to validate changes instead.

## Better Auth

For Better Auth work, consult the AI-oriented documentation at `https://better-auth.com/llms.txt`. Implementation details live in `apps/api/CLAUDE.md`.

## Nuxt UI

For Nuxt UI work, consult the AI-oriented documentation at `https://ui.nuxt.com/docs/getting-started/ai/llms-txt`. Implementation details live in `apps/web/CLAUDE.md`.

## Commit & Pull Request Guidelines

Use angular commit convention. Keep changes scoped by package where possible.

Pull requests should include a short summary, the commands run, linked issues or specs when relevant, and screenshots for visible UI changes. Note any untested areas explicitly.

## Security & Configuration Tips

Do not commit secrets or local environment files. Keep generated build output such as `.nuxt/`, `dist/`, and coverage artifacts out of source control unless the project explicitly adds them.
