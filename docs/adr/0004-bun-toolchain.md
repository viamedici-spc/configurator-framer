---
status: accepted
---

# ADR 0004: Bun runs the toolchain; tsdown builds the packages

Date: 2026-11-26

## Context

The toolchain grew from npm with a `postinstall` script that broke installs for consumers, Vite in library mode with
plugins for declarations and type checks, Vitest and TypeScript 5. Each piece had its own configuration and version
drift, and the published package mixed formats.

## Decision

- **Bun** is the package manager and script runner (`packageManager` in `package.json`, `bun.lock`), the type checker
  (`bun check`, which runs the TypeScript 7 checker and emits nothing) and the formatter (`bun fmt`, configured in
  `.oxfmtrc.json`).
- **Vitest** runs the tests, with jsdom: they need a DOM and React rendering.
- **oxlint** lints, until Bun ships a linter of its own.
- **tsdown** builds the package: the library as one ES module with its dependencies external and its declarations from the
  TypeScript 7 compiler (`typescript` is a dev dependency for that alone), and the self-contained bundle. publint and arethetypeswrong check the packed result.
- **`bun run verify`** is the one gate, locally and in CI; its independent steps run in parallel
  (`bun run --parallel`).
- **Publishing** goes through the shared CI workflow: Bun packs the tarball, `npm publish` uploads it with npm trusted
  publishing, since `bun publish` cannot use trusted publishing yet.
- **Installs** take only versions that have been public for three days (`minimumReleaseAge` in `bunfig.toml`).

## Consequences

- Type-only imports are marked as such (`verbatimModuleSyntax`).
- Contributors need Bun; editors keep their own TypeScript.
- A dependency released in the last three days is not installed until it has aged.

## Alternatives considered

- **npm and Vite as before:** the install breakage and the format mix came from there.
- **Isolated declarations:** would need explicit types on every exported member, internal modules included.
- **`bun test` for the tests:** it has no DOM environment and React Testing Library integration of its own.
