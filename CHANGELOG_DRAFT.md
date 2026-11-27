# Improvements

## Errors

- **A clear error outside `<Configuration />`:** a component that needs `<Configuration />` fails outside it with the
  error `This component must be wrapped in <Configuration />` instead of a TypeError.

# Changes

## ES modules only; React 18.2

- **ES modules only:** both packages ship ES modules and no CommonJS build anymore. The bundle's file stays
  `dist/index.js`, so import URLs only change their version.
- **The bundle ships no type declarations:** TypeScript projects use `@viamedici-spc/configurator-framer` for types.
- **React baseline:** React is a peer dependency of `^18.2`, the version Framer runs; React 17 is no longer supported.
- **TypeScript resolution:** TypeScript finds the library with `moduleResolution` `bundler`, `node16` or `nodenext`;
  `node10` (`node`) no longer finds it, since the package has an `exports` map and no `main` or `types` field.
- **Tests in Node.js:** test runners that run in Node.js, such as Vitest, need
  `server.deps.inline: [/fp-ts/, /@viamedici-spc\//]` ([README](README.md#testing-with-vitest)).

## Library API

- **`parseGlobalAttributeId`** returns `undefined` instead of `null` as `sharedConfigurationModelId` when the shared
  configuration model is empty.
- **Typings of the exported HOCs:** `withControlId` and `withErrorBoundary` require `TProps extends object`; they and
  `withFullSize` take a `ComponentType<TProps & RefAttributes<T>>`. `explainableComponent` takes a
  `ForwardRefRenderFunction<T, PropsWithoutRef<TProps>>`, and `useControlId` returns `string | null`.

## The bundle

- **configurator-ts 5 and configurator-react 5:** the bundle's `Configurator` and `ConfiguratorReact` namespaces carry
  these versions; their changes are in the
  [configurator-ts releases](https://github.com/viamedici-spc/configurator-ts/releases) and the
  [configurator-react releases](https://github.com/viamedici-spc/configurator-react/releases).

# Fixes

## Installation and stability

- **Installing the bundle with npm works again:** its package no longer has a `preinstall` script or a `file:`
  dependency.
- **No crash without an active locale:** localized names fall back to the default name when Framer reports no locale.
- **Choice components without a choice value id** show the hint "Choice Value Id missing" instead of crashing
  (`SelectionToggle`, and `SetSelection` when it includes or excludes; set to "undefined" it clears the attribute), and
  `useSortedChoiceValues` no longer crashes for an unknown attribute or without explicit choice values.
- **`ReplaceText` in set-prop mode** skips empty children and text instead of throwing.
- **Explanation lists** no longer log React key warnings.
- **The TypeScript declaration of `CustomExplainQuestion`** is the component; in 4.2.1 it was configurator-ts's
  `ExplainQuestion` type, so using it as a value did not type-check.

## Components

- **More components fail on their own:** `ScrollIntoView`, `Singleton`, `Slot`, `StoreConfiguration`, `PropagateHeight`
  and `PopoverClose` show "Component crashed" when they fail, instead of breaking the page.
- **An explainable component without an explain popover** forwards its ref.
