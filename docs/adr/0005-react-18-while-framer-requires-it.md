---
status: accepted
---

# ADR 0005: React 18.2 as peer, developed and tested on React 18, the version Framer runs

Date: 2026-11-26

## Context

Framer provides React at runtime. The library needs the `framer` package at runtime, also in a plain React
application, and that package peers `react ^18.2.0`, in version 2.4.1 as in 3.0.4. configurator-react supports React
18.2 and 19.

## Decision

React is a peer dependency of `^18.2`, and the library is developed and tested on React 18.3. The `framer` package for
development stays on 2.4.1: version 3 changes the typings of property controls, which needs a check against Framer's
runtime first (see [todo.md](../todo.md)).

## Consequences

- Framer projects use what Framer ships; plain React applications use React 18.2 or later 18.x.
- A React 19 application cannot meet the `framer` package's peer. Widening the range waits on `framer`
  ([upstream-watch.md](../upstream-watch.md)).
- Moving to `framer` 3 is a decision of its own, taken with a look in Framer.

## Alternatives considered

- **`^18.2 || ^19`, like configurator-react:** it promised a combination that the `framer` package's peer excludes, and
  nothing tested it.
- **React 19 for development:** would test a version Framer does not run.
