---
status: accepted
---

# ADR 0003: ES modules only; the bundle inlines all but React and Framer, without declarations

Date: 2026-11-26

## Context

Both packages shipped ES modules and CommonJS. Framer projects import the bundle by URL from a CDN
(`…/configurator-framer-bundle@<version>/dist/index.js`) or the library from npm; Framer provides React, React DOM and
its own modules at runtime. The bundle's published `package.json` carried a `preinstall` script and a `file:`
dependency, so installing it from npm failed.

## Decision

- Both packages are ESM only. The library keeps all dependencies external and imports fp-ts's ES modules by full path.
- The bundle inlines every dependency except React, React DOM, Framer and framer-motion into `dist/index.js`. It takes
  the packages it imports as devDependencies (the library through the workspace), so its published manifest has no
  dependencies and no install scripts; `inlinedDependencies` in the manifest lists what the build inlined.
- The bundle ships no declaration files. A Framer project imports it by URL, where the editor gets no types; TypeScript
  projects use `@viamedici-spc/configurator-framer`.

## Consequences

- No CommonJS build; Node.js is not a supported runtime.
- The bundle's file path stays `dist/index.js`, so existing import URLs keep working with a new version.
- A project that used the bundle's npm package for its types switches to the library package for them.

## Alternatives considered

- **Bundle the declarations of the three SPC packages:** the declaration bundler could not combine the workspace package
  and the namespace re-exports of three packages, and the types are unused where the bundle is used.
