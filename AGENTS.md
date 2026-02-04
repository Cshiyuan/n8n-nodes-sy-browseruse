# Repository Guidelines

Contributions expand the n8n node set for Ten Brain. Follow this guide to keep changes consistent and production ready.

## Project Structure & Module Organization
- Source TypeScript nodes live in `nodes/`. Each node folder (for example, `nodes/GithubIssues`) contains the `*.node.ts` definition plus `resources/`, `listSearch/`, and `shared/` helpers.
- Shared credential definitions reside in `credentials/`. Update the matching icon references whenever a credential name changes.
- Generated JavaScript is emitted to `dist/`; never edit this directory directly—rebuild instead.
- Static assets such as `icons/` provide light/dark variants that align with `icon` paths inside node descriptions.

## Build, Test, and Development Commands
- `npm run dev` starts `n8n-node dev` for hot-reloading against a local n8n instance—use it while iterating on operations and parameters.
- `npm run build` runs `n8n-node build`, compiling TypeScript into `dist/`. Execute before publishing or sharing artifacts.
- `npm run build:watch` keeps `tsc` running to surface type errors as you edit.
- `npm run lint` (and `npm run lint:fix`) enforce the shared ESLint/Prettier rules. Run the fix variant before opening a PR.
- `npm run dev:docker-path` points the dev build at `/Users/shiyuanchen/Project/docker-n8n-data`; adjust the path if your n8n volume differs.

## Coding Style & Naming Conventions
- TypeScript is the canonical source. Place supporting utilities close to their node in `shared/` or `listSearch/`.
- Style is inherited from `@n8n/node-cli`: tab indentation, single quotes, and ordered properties where required. Use `npm run lint:fix` to resolve complaints automatically.
- Node classes and credentials follow PascalCase (e.g., `GithubIssues`, `BrowserUseCloudApi`), while operations and helper functions stay camelCase.

## Testing Guidelines
- No automated test runner is bundled yet. Validate features via `npm run dev`, documenting node inputs/outputs in the PR.
- For reusable helpers, add lightweight checks under `nodes/<Node>/shared/__tests__` (or similar) using your preferred runner. Include execution instructions so reviewers can reproduce.

## Commit & Pull Request Guidelines
- Write concise, present-tense commit subjects (e.g., `Add repository search listSearch helper`) and group logically related changes.
- Pull requests should explain user-facing outcomes, list manual verification (`npm run lint`, `npm run build`, `npm run dev`), and link to any related issues or specs. Attach screenshots when UI fields or icons change.

## Security & Configuration Notes
- Never commit real tokens or OAuth secrets. Use descriptive placeholders and extend `.gitignore` for local config.
- Confirm OAuth callback URLs, credential display names, and icon paths during review to avoid runtime failures in n8n.
