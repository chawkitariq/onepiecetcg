# Repository Guidelines

## Project Structure & Module Organization

This pnpm workspace has two application packages:

- `packages/web/` contains the Nuxt 4 frontend. App code is in `packages/web/app/`, with pages in `app/pages/`, components in `app/components/`, CSS in `app/assets/css/`, and static files in `public/`.
- `packages/api/` contains the NestJS backend. Source files are in `packages/api/src/`; unit tests use `*.spec.ts` beside code, and e2e tests live in `packages/api/test/`.
- `docs/` contains project notes, game rules, and product specs.

## Build, Test, and Development Commands

Install dependencies from the repository root:

```bash
pnpm install
```

Run package scripts with `--dir`:

```bash
pnpm --dir packages/web dev        # start Nuxt dev server
pnpm --dir packages/web build      # build frontend
pnpm --dir packages/web lint       # lint frontend
pnpm --dir packages/web typecheck  # run Nuxt type checks

pnpm --dir packages/api start:dev  # start NestJS in watch mode
pnpm --dir packages/api build      # build backend
pnpm --dir packages/api lint       # lint and autofix backend
pnpm --dir packages/api test       # run unit tests
pnpm --dir packages/api test:e2e   # run e2e tests
pnpm --dir packages/api test:cov   # run coverage report
```

The root `pnpm test` script is a placeholder.

## Coding Style & Naming Conventions

Use TypeScript throughout. Follow Vue Composition API patterns in `packages/web/app/**/*.vue` and NestJS class-based patterns in `packages/api/src/**/*.ts`. Use PascalCase for Vue components and NestJS classes, camelCase for functions and variables, and kebab-case for route or asset filenames.

Frontend linting is provided by Nuxt ESLint. Backend linting uses ESLint, `typescript-eslint`, and Prettier. Prefer the package lint commands before submitting changes.

## Agent-Specific Instructions

Before any change, addition, or update, read `docs/spec.md` and `docs/optcg-rules.md` to confirm the implementation still matches the product scope and One Piece TCG rules. Treat `docs/spec.md` as the source of truth for product specs, MVP architecture, and feature boundaries. Treat `docs/optcg-rules.md` as the source of truth for One Piece TCG gameplay rules and gameplay structure. Keep `docs/plan.md` coherent, non-divergent, and up to date with `docs/spec.md`; when the spec changes, update the plan in the same work if the implementation steps are affected.

Before adding any dependency, always ask the user for both permission and their opinion on the proposed dependency.

## Nuxt UI

For Nuxt UI work, consult the AI-oriented documentation at `https://ui.nuxt.com/docs/getting-started/ai/llms-txt`. Start with `https://ui.nuxt.com/llms.txt` for component and pattern guidance; use `https://ui.nuxt.com/llms-full.txt` only when deeper implementation or migration detail is needed.

## Testing Guidelines

Backend unit tests use Jest and follow the `*.spec.ts` naming pattern in `packages/api/src/`. E2E tests use `packages/api/test/jest-e2e.json`. Add focused tests for new controllers, services, and behavior changes, and always include non-regression tests for important features. The frontend currently has linting and type checking but no dedicated test runner.

## Commit & Pull Request Guidelines

This repository has no commit history yet, so use angular commit convention. Keep changes scoped by package where possible.

Pull requests should include a short summary, the commands run, linked issues or specs when relevant, and screenshots for visible UI changes. Note any untested areas explicitly.

## Security & Configuration Tips

Do not commit secrets or local environment files. Keep generated build output such as `.nuxt/`, `dist/`, and coverage artifacts out of source control unless the project explicitly adds them.
