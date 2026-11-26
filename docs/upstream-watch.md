---
status: living
---

# Upstream watch

Things we would do differently if a dependency or a tool allowed it, each with the one command that says whether it does
yet.

⚠️ **Nobody polls this file.** It is read when somebody upgrades the dependency in question.

## use-debounce

### Use its own declarations

- **We would rather** use the declarations use-debounce ships.
- **We do instead** declare the used part in `packages/configurator-framer/declarations.d.ts`.
- **What blocks it:** version 8 publishes its types only under the `node` and `browser` export conditions, which the
  `bundler` module resolution does not pick.
- **Check** (a `types` condition at the top level means it resolves):

  ```bash
  npm view use-debounce@latest exports --json
  ```

- **What it would buy:** the declaration in `declarations.d.ts` goes away (an upgrade to a later major is on the to-do
  list).
- **Upstream:** not reported.
- **Last checked:** use-debounce 8, 2026-11-26: types under `node`/`browser` only.

## fp-ts

### Load the packages in Node.js-based test runners without configuration

- **We would rather** test with Vitest without extra settings.
- **We do instead** set `server.deps.inline: [/fp-ts/, /@viamedici-spc\//]` in
  `packages/configurator-framer/vitest.config.mts` (and document it in the README).
- **What blocks it:** fp-ts 2.x ships ES modules whose imports have no file extensions; Node.js cannot load them.
- **Check** (an `exports` field means fp-ts may be loadable as ESM):

  ```bash
  npm view fp-ts@latest exports
  ```

- **What it would buy:** the setting goes away; so does it once the libraries no longer use fp-ts.
- **Upstream:** fp-ts 2.x is in maintenance.
- **Last checked:** fp-ts 2.16.11, 2026-11-26: no `exports` field.

## Bun

### Lint with `bun lint`

- **We would rather** lint with Bun itself.
- **We do instead** run oxlint (`bun run lint` in each package).
- **Check** (help text instead of "Script not found" means it exists):

  ```bash
  bun lint --help
  ```

- **What it would buy:** one tool less.
- **Upstream:** Bun release notes.
- **Last checked:** Bun 1.4.5, 2026-11-26: not available.

### Publish with `bun publish`

- **We would rather** publish with `bun publish`.
- **We do instead** pack with `bun pm pack` and publish with `npm publish` in the shared CI workflow.
- **Check** (`CLOSED` means it may have landed):

  ```bash
  gh issue view 22423 --repo oven-sh/bun --json state --jq .state
  ```

- **What it would buy:** no Node.js setup in the publish job.
- **Upstream:** https://github.com/oven-sh/bun/issues/22423
- **Last checked:** Bun 1.4.5, 2026-11-26: open.
