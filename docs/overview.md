---
status: accepted
---

# configurator-framer

## Purpose

Code components for Framer that build a product configurator on SPC: a `Configuration` component that owns the session,
selects, toggles and inputs for attributes, names, explanations, store and restore, and helpers for templates and
slots. Designers place and style them in Framer through property controls; the components are headless enough to work
in plain React applications too.

Out of scope: the session logic itself (configurator-react and configurator-ts) and a design system of fixed visuals.

## Public contract

- `packages/configurator-framer` exports the components, their props types and hooks from
  `packages/configurator-framer/src/index.ts`. A component's property controls are part of its contract, since Framer
  projects store their values.
- `packages/configurator-framer-bundle` exports `Configurator` (configurator-ts), `ConfiguratorReact` and
  `ConfiguratorFramer` from one self-contained ES module, `dist/index.js`, which Framer projects import by URL.

## Invariants

- **The bundle inlines everything except React, React DOM and Framer's modules**, which Framer provides at runtime; its
  file path `dist/index.js` stays stable.
- **The library keeps its dependencies external** and pins configurator-react exactly.
- **A component never crashes the canvas**: components are wrapped in error boundaries, and a missing provider fails
  with a message naming it.

## Architecture

Components live in `packages/configurator-framer/src/components/`, wrapped by the higher-order components in
`packages/configurator-framer/src/hoc/` and `packages/configurator-framer/src/common/` (error boundary, control id,
explain popover). Session state comes from configurator-react's hooks; Framer-specific concerns (locales, property
controls, host parameters) are described in the [feature notes](features/) and [ADRs](adr/).

## Supported environments

Framer (React 18), through the bundle or by importing the library from npm; plain React applications with React 18.2
or 19 through a bundler. ESM only, not Node.js ([ADR 0003](adr/0003-browser-target-esm-only-and-the-bundle.md)).

## Commands

| Command | What it does |
|---|---|
| `bun install` | Installs both packages (one Bun workspace). |
| `bun run verify` | The gate for both packages: type check, lint, format check, tests, builds, package checks (`package.json` unchanged, the library's consumer type check, publint, arethetypeswrong). |
| `bun run build` | Builds the library and the bundle. |
| `bun run dev` | Rebuilds both packages on change. |
| `bun run preview` | Serves the bundle on `http://localhost:3000/index.js` for a Framer project during development. |
| `bun fmt` | Formats the code. |

## Links

- [AGENTS.md](../AGENTS.md), [todo.md](todo.md), [upstream-watch.md](upstream-watch.md).
