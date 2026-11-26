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
  - `packages/configurator-framer/src/components/Configuration.tsx`: the memoized session context misses
    `wizardAttributeRelations` and lists `sessionDeleteUrl` without using it.
  - `packages/configurator-framer/src/components/ScrollIntoView.tsx`: reads `rootRef.current` during render and misses
    `delay`.
  - `packages/configurator-framer/src/components/Singleton.tsx`: misses `singletonId`, reads a ref in the cleanup.
  - `packages/configurator-framer/src/components/Colorize.tsx`: a layout effect without dependencies sets state.
  - `packages/configurator-framer/src/components/explain/ExplainPopover.tsx`: reads `arrow.height` during render next to
    `ref={arrow.element}` (`react/refs`); probably a false positive, to silence at that line.
  - `packages/configurator-framer/src/components/SetSelections.tsx`: the effect misses `trigger`.
  - `packages/configurator-framer/src/components/SetTemplateSlots.tsx`,
    `packages/configurator-framer/src/components/explain/styled/explainPopover/ShowMoreButton.tsx`,
    `packages/configurator-framer/src/hooks/useSortedChoiceValues.ts`,
    `packages/configurator-framer/src/hooks/localization.ts`,
    `packages/configurator-framer/src/hooks/useDebounceValue.ts`: memoized values and effects miss inputs they read.
  - `packages/configurator-framer/src/components/ChoiceSelect.tsx`,
    `packages/configurator-framer/src/components/BooleanSelect.tsx`,
    `packages/configurator-framer/src/components/ComponentSelect.tsx`: the select has no accessible label.
  **Waits on** a session with Framer open. **Done when** the three rules are on again and `bun run verify` passes.

- [ ] **Follow the Rules of Hooks** (2026-11-26) — `react/rules-of-hooks` is not in oxlint's `correctness` category, so
  the lint runs without it. Switched on, it reports 22 sites:
  - Hooks after an early return, so a changed prop (in the editor, say) changes the number of hooks:
    `packages/configurator-framer/src/hooks/localization.ts` (`useChoiceValueNames` returns before two `useMemo` for an
    unknown attribute), `packages/configurator-framer/src/components/PropagateHeight.tsx`,
    `packages/configurator-framer/src/components/StoreConfiguration.tsx`,
    `packages/configurator-framer/src/components/SelectionIndicator.tsx`,
    `packages/configurator-framer/src/components/InitializationError.tsx`,
    `packages/configurator-framer/src/components/popover/PopoverClose.tsx`,
    `packages/configurator-framer/src/components/explain/custom/explainPopover/ExplainContent.tsx`,
    `packages/configurator-framer/src/props/useCommonExplainProps.tsx`.
  - Hooks inside a helper function that runs only under a condition (a custom name, the canvas, a found attribute):
    `packages/configurator-framer/src/components/AttributeName.tsx`,
    `packages/configurator-framer/src/components/ChoiceValueName.tsx`,
    `packages/configurator-framer/src/components/SelectedNumericValue.tsx`,
    `packages/configurator-framer/src/components/SatisfactionIndicator.tsx`; and hooks inside the `match` callbacks of
    `packages/configurator-framer/src/components/explain/styled/common/ExplainHeader.tsx`, which run per explain
    subject.
  - False positives: `packages/configurator-framer/src/hooks/useParseRawAttributeRelations.tsx`,
    `packages/configurator-framer/src/hooks/useParseRawLocalization.tsx` and
    `packages/configurator-framer/src/hooks/useParseRawChoiceValueSorting.tsx` create a hook at module level with
    `useGenericParseRawData`.
  A violation is fixed by calling the hooks before the condition, or by splitting the component in two: an outer one
  that decides the placeholder and an inner one with the hooks. **Waits on** a session with Framer open, as the rules
  above. **Done when** `react/rules-of-hooks` is on and `bun run verify` passes.

## Documents

- [ ] **Bring the feature notes into the feature-note scheme** (2026-11-26) — the notes under `docs/features/` carry
  knowledge beyond the scheme: the designer matrix for `noOptionsAvailableColors` and `allOptionsBlockedColors`, the
  component contracts, change lists and rollout notes. That knowledge moves to the planned wiki as guidance for
  designers. Then each note follows `docs/conventions/templates/feature-template.md`: no rollout or migration notes, no
  file lists, the sections *Tests that define behavior* and *Links*, and its prose wrapped at 120 columns. **Waits on**
  the planned wiki. **Done when** the knowledge is in the wiki and every note follows the template.

## Release

- [ ] **fp-ts-extensions at its release** (2026-11-26) — `packages/configurator-framer/package.json` and
  `packages/configurator-framer-bundle/package.json` pin the prerelease `2.0.0-modern-toolchain-20261126094931`; before
  merging into `main`, they pin the released 2.0.0. **Waits on** the fp-ts-extensions 2.0.0 release. **Done when**
  `packages/configurator-framer/package.json` and `packages/configurator-framer-bundle/package.json` name `2.0.0` and
  `bun run verify` passes.

## Dependencies

- [ ] **`framer` 3 for development** (2026-11-26) — version 3 changes the typings of property controls (FusedNumber
  padding, `maxLength` on string controls). **Waits on** knowing which version Framer's runtime runs. **Done when** the
  package is on 3.x, `bun run verify` passes and the components behave the same in Framer.
- [ ] **Majors with API changes** (2026-11-26) — zod 4, react-number-format 5, react-error-boundary 6, Font Awesome 7,
  use-debounce 10. **Waits on** nothing. **Done when** each is upgraded or deliberately kept, with a look in Framer.
