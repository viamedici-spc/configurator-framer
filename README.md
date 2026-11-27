<div >
  <strong>Viamedici SPC</strong>
</div>

# configurator-framer

[![npm version](https://img.shields.io/npm/v/@viamedici-spc/configurator-framer-bundle)](https://www.npmjs.com/package/@viamedici-spc/configurator-framer-bundle)
[![license](https://img.shields.io/npm/l/@viamedici-spc/configurator-framer-bundle)](https://github.com/viamedici-spc/configurator-framer/blob/main/LICENSE)
[![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/viamedici-spc/configurator-framer/main.yml?branch=main)](https://github.com/viamedici-spc/configurator-framer/actions/workflows/main.yml?query=branch%3Amain)

## Introduction

The Configurator Components Library is a set of headless UI components that form the foundation of the
[Configurator UIKit](https://spc-configurator-uikit.framer.ai/) for Framer.

These React-based UI components are optimized for seamless integration within Framer, while also being fully compatible
with standalone React applications (React 18.2, the version Framer runs, through a bundler). Both packages ship ES
modules only. TypeScript resolves the library with `moduleResolution` `bundler`, `node16` or `nodenext`.

## Installation

To integrate the UI components into a Framer application, start by creating a new code file (e.g. `ConfiguratorLib`).
Import the `@viamedici-spc/configurator-framer-bundle` package and export the components you need.

The exported components will then be available in the assets panel as local components.

#### ConfiguratorLib.tsx

```typescript
import type {ComponentType} from "react";
import {ConfiguratorFramer} from "https://cdn.jsdelivr.net/npm/@viamedici-spc/configurator-framer-bundle@<version>/dist/index.js"

export const Configuration: ComponentType = ConfiguratorFramer.Configuration;
export const ChoiceSelect: ComponentType = ConfiguratorFramer.ChoiceSelect;
export const SelectionToggle: ComponentType = ConfiguratorFramer.SelectionToggle;
```

### In a React application

A React application uses the library through a bundler; React and `framer` are peer dependencies:

```bash
bun add @viamedici-spc/configurator-framer react framer
```

### Why Use the Bundle?

Framer allows direct importing of npm packages, such as `@viamedici-spc/configurator-framer`, as long as the package and
all its dependencies are compliant with the JavaScript Module System. Framer resolves dependencies for you behind the
scenes.

However, there is a limitation: you don't have control over the version of the referenced package. Once imported,
updating to a newer version becomes impossible. Hopefully Framer supports version selection in the future.

To address this, the library is also provided as a bundled package with all dependencies integrated. This allows you to
directly import the hosted `index.js` module (for example via jsDelivr), ensuring version control and easier updates. If
Framer adds granular version selection later, direct package imports can become the preferred path again.

The bundle ships no type declarations: in Framer, URL imports get no types. TypeScript projects use the
`@viamedici-spc/configurator-framer` package.

## Testing with Vitest

fp-ts 2.x ships ES modules whose imports have no file extensions, which Node.js cannot load. Test runners that run in
Node.js, such as Vitest, therefore have to let their bundler transform fp-ts and the SPC packages:

```ts
// vitest.config.ts
import {defineConfig} from "vitest/config";

export default defineConfig({
    test: {
        server: {deps: {inline: [/fp-ts/, /@viamedici-spc\//]}},
    },
});
```

`bun test` and the bundlers (Vite, webpack 5, Rollup, esbuild) need no such setting.

## Live Demo

Below are demo configurator applications that showcase the UI components from the Configurator UIKit in action:

- [Adventure Wheels (Simple)](https://adventure-wheels-simple.framer.ai/)
- [Adventure Wheels (Advanced)](https://adventure-wheels-advanced.framer.ai/)
- [Sudoku Solver](https://spc-sudoku-solver.framer.ai/)

## License

This project is licensed under the MIT License - see the LICENSE file for details.
