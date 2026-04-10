# Project: backstage-open-feedback

A published Backstage plugin monorepo providing an open feedback system for Backstage portals. Built on top of the Backstage framework — many patterns mirror upstream Backstage conventions.

## Package Scope

All packages are scoped under `@parsifal-m/`. There are three plugin packages:

| Package | Role | Path |
| --- | --- | --- |
| `@parsifal-m/backstage-plugin-open-feedback` | Frontend plugin (old frontend system) | `plugins/open-feedback` |
| `@parsifal-m/backstage-plugin-open-feedback-backend` | Backend plugin | `plugins/open-feedback-backend` |
| `@parsifal-m/backstage-plugin-open-feedback-common` | Shared types, permissions | `plugins/open-feedback-common` |

`packages/app` and `packages/backend` are local example apps for development only — they are not published.

## Key Conventions

- TypeScript strict mode throughout. No `any`.
- Frontend plugin uses the **old frontend system** (`@backstage/core-plugin-api`). Do not migrate to the new frontend system unless explicitly asked.
- Backend plugin uses `@backstage/backend-plugin-api` (new backend system).
- MUI v4 (`@material-ui/core`) is used in the frontend plugin. Do not upgrade to MUI v5 or BUI unless explicitly asked.
- Database migrations live in `plugins/open-feedback-backend/migrations/`.

## Development Commands

Run all commands from the project root after `yarn install`.

- **Dev server**: `yarn dev` (frontend :3000, backend :7007)
- **Test**: `yarn test <path>` — always provide a path, never run all tests
- **Type check**: `yarn tsc`
- **Format**: `yarn prettier:write` — run before committing
- **Lint**: `yarn lint:all`
- **Scaffold**: `yarn new --scope internal`

Never run `yarn build`, `yarn build:all`, or any release commands. Builds are handled by CI.

## Commits

- Sign all commits: `git commit -s -m "message"`
- Run `yarn prettier:write` before committing

## Testing Standards

- Prefer fewer thorough tests with multiple assertions over many small tests
- Use React Testing Library `screen` and `.findBy*` queries; avoid `waitFor` and test IDs in implementation

## Pull Requests

When creating a PR, follow the contribution checklist in `CONTRIBUTING.md`: tests pass, docs updated if needed, code formatted.
