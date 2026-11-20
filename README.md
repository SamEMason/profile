# Profile

A structured, persistent source of truth for a person's experiences.

People constantly generate valuable experience through work, learning and projects, but most of it is never captured in a reusable form. Profile turns raw experience into structured data that many applications can use later.

The first version captures software development experience through a coding-agent skill. The agent finds candidate experiences in your development context, refines them with you in conversation and saves the records you approve.

**Status:** early development.

## Development

Requires Node 22+ and pnpm.

```sh
pnpm install
pnpm dev        # run with reload on save
pnpm typecheck  # type-check
pnpm build      # compile to dist/
pnpm start      # run the compiled output
```
