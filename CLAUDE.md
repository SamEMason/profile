# Profile

A structured, persistent source of truth for a person's experiences. The first version captures software development experience through a coding-agent skill and saves it via MCP tools. The scope is capture only: no résumés, portfolios or other consumption yet.

## How we work

This project is augmented manual programming: the user writes and directs the code.

- Don't generate code, scaffold or run multi-step work unless asked. Do exactly what was requested.
- Help by explaining, looking up docs, reviewing and debugging. Offer sketches; don't write files unprompted.
- Challenge assumptions and keep scope small. No process or infrastructure for its own sake.

## Stack

- Node 22, pnpm 12, TypeScript 7 (native compiler), ESM.
- `module: nodenext`: relative imports use `.js` extensions in `.ts` files.
- Source in `src/`, compiled to `dist/`.

## Commands

- `pnpm dev`: run `src/index.ts` with tsx, restarting on save (no type-checking)
- `pnpm typecheck`: type-check with `tsc --noEmit`
- `pnpm build`: compile to `dist/`
- `pnpm start`: run `dist/index.js`
