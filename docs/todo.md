---
status: living
---

# To-do

**Work that is decided and not yet done**, defects included. What is undecided is
[discussion-points.md](discussion-points.md); an idea for later is [backlog.md](backlog.md).

> Format: `- [ ] **<Title>** (YYYY-MM-DD) — what and why. **Waits on** <nothing | what>. **Done when** <check>.`

## Code

- [ ] **Resolve the deferred React lint rules** (2026-11-26) — `react-hooks/exhaustive-deps`, `react/refs` and
  `jsx-a11y/control-has-associated-label` are off in `.oxlintrc.json`: fixing them changes when effects run, how refs
  are read and what a select announces, which needs a look in Framer. The sites, from the repository root:
  - `packages/configurator-framer/src/components/Configuration.tsx`: the memoised session context misses
    `wizardAttributeRelations` and lists `sessionDeleteUrl` without using it.
  - `packages/configurator-framer/src/components/ScrollIntoView.tsx`: reads `rootRef.current` during render and misses
    `delay`.
  - `packages/configurator-framer/src/components/Singleton.tsx`: misses `singletonId`, reads a ref in the cleanup.
  - `packages/configurator-framer/src/components/Colorize.tsx`: a layout effect without dependencies sets state.
  - `packages/configurator-framer/src/components/SetSelections.tsx`: the effect misses `trigger`.
  - `packages/configurator-framer/src/components/SetTemplateSlots.tsx`, `explain/styled/explainPopover/ShowMoreButton.tsx`,
    `packages/configurator-framer/src/hooks/useSortedChoiceValues.ts`, `localization.ts`, `useDebounceValue.ts`:
    memoised values and effects miss inputs they read.
  - `ChoiceSelect.tsx`, `BooleanSelect.tsx`, `ComponentSelect.tsx` (in `packages/configurator-framer/src/components/`):
    the select has no accessible label.
  **Waits on** a session with Framer open. **Done when** the three rules are on again and `bun run verify` passes.

## Dependencies

- [ ] **`framer` 3 for development** (2026-11-26) — version 3 changes the typings of property controls (FusedNumber
  padding, `maxLength` on string controls). **Waits on** knowing which version Framer's runtime runs. **Done when** the
  package is on 3.x, `bun run verify` passes and the components behave the same in Framer.
- [ ] **Majors with API changes** (2026-11-26) — zod 4, react-number-format 5, react-error-boundary 6, Font Awesome 7,
  use-debounce 10. **Waits on** nothing. **Done when** each is upgraded or deliberately kept, with a look in Framer.
