# Repository Guidelines

## Project Structure & Module Organization
- `packages/configurator-framer/` is the main component library (React + TypeScript) for Framer.
- `packages/configurator-framer/src/` contains components, hooks, common utilities, HOCs, property controls (`props/`), and the design system.
- `packages/configurator-framer/tests/` holds Vitest unit tests.
- `packages/configurator-framer-bundle/` builds a bundled distribution that inlines dependencies for Framer/JSPM use.
- Root `README.md` documents installation and usage.

## Architecture Overview
- SPC uses a backend Configuration Engine (session-based REST API) that solves configuration decisions and returns consequences.
- A TypeScript client (configurator-ts) handles session management, automatic resume, and optimistic decisions on top of that API.
- A React library (configurator-react) builds on the client and exposes hooks for easier UI integration.
- This repository provides the Framer layer: components and property controls that wrap the React hooks for fast configurator UI composition in Framer.

## Build, Test, and Development Commands
Run commands from the package directories.
- `npm --prefix packages/configurator-framer run build` builds the library with Vite.
- `npm --prefix packages/configurator-framer run dev` builds in watch mode and serves a preview.
- `npm --prefix packages/configurator-framer run test` runs type checks plus Vitest.
- `npm --prefix packages/configurator-framer run test:watch` runs Vitest in watch mode.
- `npm --prefix packages/configurator-framer run typecheck` runs TypeScript without emitting.
- `npm --prefix packages/configurator-framer-bundle run build` builds the bundled package (calls the main build first).

## Coding Style & Naming Conventions
- TypeScript + React; files are mostly `.tsx` for components and `.ts` for utilities.
- Indentation is 4 spaces; semicolons are used.
- Use PascalCase for components (`ChoiceSelect.tsx`) and camelCase for hooks (`useExplain.ts`).
- Prefer small, focused modules under `src/components/`, `src/hooks/`, and `src/common/`.

## Testing Guidelines
- Tests use Vitest with TypeScript (`packages/configurator-framer/tests/`).
- Test files follow `*.test.ts` naming (example: `choiceValueSorting.test.ts`).
- Run `npm --prefix packages/configurator-framer run test` before submitting changes.

## Commit & Pull Request Guidelines
- Commit history uses short, sentence-case messages, typically past tense (e.g., “Updated configurator-react to 3.0.0”).
- Keep commits focused and avoid noisy, multi-topic changes.
- PRs should include: a brief summary, testing notes, and screenshots or GIFs for UI changes. Link related issues when applicable.

## Configuration Tips
- The bundle package (`packages/configurator-framer-bundle`) exists to pin dependency versions for Framer/JSPM imports.
- `prepack`/`postpack` scripts copy the root `README.md` into published packages; keep root docs up to date.

## Documentation
- Library documentation lives under `packages/configurator-framer/docs/` (feature notes, patterns, references, conventions (changelog)).
