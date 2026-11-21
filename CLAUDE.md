# Profile

A structured, persistent source of truth for a person's experiences. The first version captures software development experience through a coding-agent skill and saves it via MCP tools. The scope is capture only: no résumés, portfolios or other consumption yet.

## How we work

This project is augmented manual programming: the user writes and directs the code.

- Don't generate code, scaffold or run multi-step work unless asked. Do exactly what was requested.
- Help by explaining, looking up docs, reviewing and debugging. Offer sketches; don't write files unprompted.
- Challenge assumptions and keep scope small. No process or infrastructure for its own sake.

## Stack

- Node 24, pinned with pnpm's `devEngines.runtime`. pnpm downloads it and uses it for every `pnpm` command and the git hook. Plain `node` in the shell may be a different version.
- pnpm 12, ESM, TypeScript, Vitest, ESLint, Prettier, Husky with lint-staged.
- `module: nodenext`: relative imports use `.js` extensions in `.ts` files.

### TypeScript 6/7 workaround

TS 7 (the native compiler) has no JS API yet, so typescript-eslint can't use it. Following Microsoft's guide, there are two installs:

- `@typescript/native` is TS 7. It provides `tsc`, used by `build` and `typecheck`.
- `typescript` is an alias for `@typescript/typescript6` (TS 6.0), used by typescript-eslint.

Remove the aliases once typescript-eslint supports TS 7.1+. The remaining peer warning about `@typescript/native` wanting 7.1 is expected.

## Layout

- `src/`: application code, compiled to `dist/` by `tsconfig.build.json`.
- `tests/`: Vitest tests (`*.test.ts`).
- `config/`: tooling config (`lint-staged.ts`).
- `tsconfig.json`: type-checking only (`noEmit`). Covers `src`, `tests`, `config` and `eslint.config.ts`.

## Commands

- `pnpm dev`: run `src/index.ts` with tsx, restarting on save (no type-checking)
- `pnpm test`: run tests once
- `pnpm typecheck`: type-check everything
- `pnpm lint`: ESLint
- `pnpm format` / `pnpm format:check`: Prettier, writing fixes or only checking
- `pnpm build`: compile `src/` to `dist/`
- `pnpm start`: run `dist/index.js`

The pre-commit hook (`.husky/pre-commit`) runs lint-staged (ESLint and Prettier fixes on staged files), then `pnpm typecheck` and `pnpm test`.

## Privacy

The GitHub repo is public. Never commit secrets, personal data or captured experience records. `*.db` and `.env*` are gitignored.
