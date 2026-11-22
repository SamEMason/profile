# Profile

A structured, persistent source of truth for a person's experiences.

People constantly generate valuable experience through work, learning and projects, but most of it is never captured in a reusable form. Profile turns raw experience into structured data that many applications can use later.

The first version captures software development experience through coding-agent skills. The agent finds candidate experiences, either from the work you've just done or by going back through an existing project. It refines them with you in conversation and saves the records you approve.

See the [development plan](docs/profile-development-plan.md) for the architecture, phases and next steps.

**Status:** early development.

## Development

Requires pnpm. The project pins Node 24, and pnpm downloads it automatically.

```sh
pnpm install
pnpm dev           # run with reload on save
pnpm test          # run tests
pnpm typecheck     # type-check
pnpm lint          # ESLint
pnpm format        # Prettier (format:check to only check)
pnpm build         # compile to dist/
pnpm start         # run the compiled output
```

A pre-commit hook lints and formats staged files, then runs the typecheck and tests.
