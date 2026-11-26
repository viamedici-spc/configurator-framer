# Changes

## ES modules only; React 18.2 or 19

- **ES modules only:** both packages ship ES modules and no CommonJS build anymore. The bundle's file stays
  `dist/index.js`, so import URLs only change their version.
- **The bundle ships no type declarations:** TypeScript projects use `@viamedici-spc/configurator-framer` for types.
- **React baseline:** React is a peer dependency of `^18.2 || ^19` (React 17 is no longer supported); Framer runs React 18.

# Fixes

- **Installing the bundle with npm works again:** its package no longer has a `preinstall` script or a `file:`
  dependency, and the library no longer runs a `postinstall` script.
- **No crash without an active locale:** localized names fall back to the default name when Framer reports no locale.
- **Choice components without a choice value id** show the hint "Choice Value Id missing" instead of crashing
  (`SelectionToggle`, `SetSelection`), and `useSortedChoiceValues` no longer crashes for an unknown attribute or
  without explicit choice values.
- **`ReplaceText` in set-prop mode** skips empty children and text instead of throwing.
- **Explanation lists** no longer log React key warnings.
