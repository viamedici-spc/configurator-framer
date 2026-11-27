---
status: accepted
---

# Vision

## Goals

- A designer builds a working product configurator in Framer without writing code: drop the components, bind them to
  attributes, style them with Framer's tools.
- Updates are under the project's control: the bundle is imported by version.

## Non-goals

- Fixed visuals; the components are styled in Framer.
- Logic beyond what configurator-react offers; new session features land there first.

## Audiences

Designers and developers building configurators in Framer, and the coding agents that help them.

## Place among the SPC libraries

The library builds on configurator-react and configurator-ts. It adds what those two do not have: Framer code
components with their property controls, and the self-contained bundle that a Framer project loads from a CDN.
