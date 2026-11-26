---
status: accepted
---

# ADR 0005: Developed and tested on React 18, the version Framer runs

Date: 2026-11-26

## Context

Framer provides React at runtime; its `framer` package for code components requires `react ^18.2`. configurator-react
supports React 18.2 and 19.

## Decision

React is a peer dependency of `^18.2 || ^19`, like configurator-react, but the library is developed and tested on React
18.3. The `framer` package for development stays on 2.4.1: version 3 changes the typings of property controls, which
needs a check against Framer's runtime first (see [todo.md](../todo.md)).

## Consequences

- Plain React applications may use React 19; Framer projects use what Framer ships.
- Moving to React 19 or `framer` 3 is a decision of its own, taken with a look in Framer.

## Alternatives considered

- **React 19 for development:** would test a version Framer does not run.
