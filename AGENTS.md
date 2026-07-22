# Repository Guidelines

## Project Structure & Module Organization

This pnpm workspace has two application packages:

- `packages/web/` contains the Nuxt 4 frontend. See `packages/web/CLAUDE.md` for its architecture, commands, and conventions.
- `packages/api/` contains the NestJS backend. See `packages/api/CLAUDE.md` for its architecture, commands, and conventions.
- `packages/shared/` contains types and helpers shared between `api` and `web` (`packages/shared/src/index.ts`).
- `docs/` contains project notes, game rules, and product specs.

## Build, Test, and Development Commands

Install dependencies from the repository root:

```bash
pnpm install
```

Run package scripts with `--dir`, e.g. `pnpm --dir packages/api start:dev`. Backend commands are documented in `packages/api/CLAUDE.md`, frontend commands in `packages/web/CLAUDE.md`.

The root `pnpm test` script is a placeholder.

## Coding Style & Naming Conventions

Use TypeScript throughout. Follow Vue Composition API patterns in `packages/web/app/**/*.vue` and NestJS class-based patterns in `packages/api/src/**/*.ts`. Use PascalCase for Vue components and NestJS classes, camelCase for functions and variables, and kebab-case for route or asset filenames.

Backend linting uses ESLint, `typescript-eslint`, and Prettier (see `packages/api/CLAUDE.md`). Frontend linting is provided by Nuxt ESLint (see `packages/web/CLAUDE.md`). Prefer the package lint commands before submitting changes.

## Agent-Specific Instructions

### Specs & Documentation Sync

Before any change, addition, or update, read `docs/spec.md` and `docs/optcg-rules.md` to confirm the implementation still matches the product scope and One Piece TCG rules. Treat `docs/spec.md` as the source of truth for product specs, MVP architecture, and feature boundaries. Treat `docs/optcg-rules.md` as the source of truth for One Piece TCG gameplay rules and gameplay structure. Keep `docs/plan.md` coherent, non-divergent, and up to date with `docs/spec.md`; when the spec changes, update the plan in the same work if the implementation steps are affected.

### Dependencies

Before adding any dependency, always ask the user for both permission and their opinion on the proposed dependency.

### Code Documentation

Always document exported functions, classes, and methods with JSDoc.

### Testing Requirements

Always add unit tests for new features and behavior changes, and add e2e tests when the change is not adequately covered by unit tests (e.g. new API endpoints or realtime flows). Backend and frontend testing conventions are documented in `packages/api/CLAUDE.md` and `packages/web/CLAUDE.md` respectively. Add focused tests for new controllers, services, components, and behavior changes, and always include non-regression tests for important features.

### Build

Never run the package `build` commands (`pnpm build` / `pnpm --dir <package> build`) — use `lint`, `typecheck`, and `test`/`test:e2e` to validate changes instead.

## Better Auth

For Better Auth work, consult the AI-oriented documentation at `https://better-auth.com/llms.txt`. Implementation details live in `packages/api/CLAUDE.md`.

## Commit & Pull Request Guidelines

Use angular commit convention. Keep changes scoped by package where possible.

Pull requests should include a short summary, the commands run, linked issues or specs when relevant, and screenshots for visible UI changes. Note any untested areas explicitly.

## Security & Configuration Tips

Do not commit secrets or local environment files. Keep generated build output such as `.nuxt/`, `dist/`, and coverage artifacts out of source control unless the project explicitly adds them.
