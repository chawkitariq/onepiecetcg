# E2E tests — known issue

`pnpm test:e2e` currently fails on every spec, including `app.e2e-spec.ts`
(pre-existing, not introduced by the `me`/`private-auth-check`/`decks`/`catalog`
specs added alongside this note). The failure is not test-specific — it happens
as soon as `AppModule` is imported:

```
SyntaxError: Cannot use import statement outside a module
  .../node_modules/@thallesp/nestjs-better-auth/dist/index.mjs:1
  import { createParamDecorator, ... } from '@nestjs/common';
```

## Root cause

`@thallesp/nestjs-better-auth` ships **ESM-only** (`"type": "module"`, no CJS
build — confirmed via its `package.json` `exports` map and `dist/` contents,
which contain only `index.mjs`). `AppModule` imports it directly
(`app.module.ts`), and `ts-jest`'s default transform is CJS-based and skips
`node_modules`, so Jest can't parse the `.mjs` file's `import` syntax.

`isolatedModules: false` (already set in both `package.json`'s `jest` block and
`test/jest-e2e.json`) fixes a *different*, real problem — `@colyseus/schema`
decorator registration silently failing under `ts-jest`'s default isolated
transpilation — but it does not touch this ESM issue at all.

## What doesn't fix it

- `transformIgnorePatterns` allowing `@thallesp/nestjs-better-auth`/`better-auth`
  through: `ts-jest`'s CJS transform still can't emit valid output for a
  `.mjs` source file without ESM mode enabled.
- `babel-jest` for `.mjs` files: fails with the same error unless a real
  Babel ESM→CJS preset (e.g. `@babel/preset-env`) is installed and configured
  — not currently a dependency of this package.
- `ts-jest`'s `useESM: true` + `extensionsToTreatAsEsm` + `NODE_OPTIONS=
  --experimental-vm-modules`: gets further (`.mjs` parses), but then fails on
  our **own** source: `ReferenceError: exports is not defined` when importing
  `app.module.ts`. This is because `tsconfig.json` already targets
  `"module": "nodenext"`, but `packages/api/package.json` has no `"type"`
  field (defaults to CommonJS) — so TypeScript/`ts-jest` still emits CJS
  `exports.foo = ...` for our own files even while Jest tries to import them
  as ESM, a mismatch.

## The actual fix, and why it's a separate task

Setting `"type": "module"` in `packages/api/package.json` (which the
`nodenext` `tsconfig.json` already implies is the intended target) removes
that mismatch — confirmed by testing it directly. But doing so immediately
surfaces **65 compile errors from `nest build` alone**: Node's ESM resolver
under `nodenext` requires every relative import across `src/` to use an
explicit `.js` extension, e.g.:

```ts
// before
import { AppModule } from './app.module';
// after
import { AppModule } from './app.module.js';
```

This is a mechanical but sweeping change touching essentially every file in
`packages/api/src/` and `packages/api/test/`, not a jest-config-only fix, so
it needs its own dedicated pass:

1. Add `.js` extensions to every relative import in `src/` and `test/`.
2. Add `"type": "module"` to `package.json`.
3. Update both jest configs (`package.json`'s `jest` block and
   `test/jest-e2e.json`) for native ESM: `extensionsToTreatAsEsm: [".ts"]`,
   `ts-jest`'s `useESM: true`, and run Jest with
   `NODE_OPTIONS=--experimental-vm-modules`.
4. Re-verify `nest build`, `nest start`, all 32 existing unit tests, and the
   four e2e specs (`me`, `private-auth-check`, `decks`, `catalog`) against a
   real database.

## Current state of the e2e specs

`me.e2e-spec.ts`, `private-auth-check.e2e-spec.ts`, `decks.e2e-spec.ts`,
`catalog.e2e-spec.ts`, and the shared `auth-fixture.ts` helper (which seeds a
real Better Auth session via TypeORM and signs the cookie the same way
Better Auth's own cookie handler does, using the public
`better-auth/crypto#makeSignature` export) are written, typecheck cleanly,
and pass lint — they are correct as far as static analysis can confirm, but
have never executed, because of the issue above.
