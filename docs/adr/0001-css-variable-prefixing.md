# ADR 0001: CSS Custom Property Prefixing via Stylis Plugin
Date: 2026-05-07

## Context

The Framer configurator application can be embedded in host websites in two ways:

1. **Via iFrame** — fully isolated; no CSS conflicts possible.
2. **Natively as a Web Component** — shares the same DOM and CSS scope with the host page.

In the Web Component case, the library's design system injects CSS custom properties globally into `:root` (via `createGlobalStyle` from styled-components), e.g.:
- `--space-unit`, `--text-base-size`, `--font-primary`, `--shape-border-radius-*`, etc.

These generic names can collide with CSS variables defined by the host website.

**Shadow DOM is not an option:** Web Components normally offer Shadow DOM for CSS isolation. However, the Framer application is not prepared for Shadow DOM — Framer-internal styles, font loading, and event handling all rely on the global DOM. Shadow DOM is therefore ruled out as a solution.

## Decision

All CSS custom properties rendered by styled-components in this library automatically receive the `--spc-` prefix (e.g. `--space-unit` → `--spc-space-unit`).

The transformation is applied via a **Stylis middleware plugin** (`cssVariablePrefixPlugin`), registered in the `StyleSheetManager` of the `Configuration` component. The plugin transforms:
1. Custom property **declarations**: `--foo: bar` → `--spc-foo: bar`
2. `var()` **references** in values: `var(--foo)` → `var(--spc-foo)`

Excluded from prefixing:
- Already-prefixed variables (`--spc-*`) — prevents double-prefixing
- Framer's own variables (`--framer-*`) — set by Framer in the host and must not be renamed

**Affected files:**
- `src/designSystem/cssVariablePrefixPlugin.ts` — plugin implementation
- `src/components/Configuration.tsx` — `StyleSheetManager` with plugin at the root

## Consequences

**Positive:**
- No changes needed to the template strings in Shapes/Spacing/Typography — fully automatic

**Risks / Trade-offs:**
- The Stylis plugin API is not officially documented by styled-components — verify on major upgrades
- Styled components rendered **outside** the `Configuration` component (unsupported use case) will not receive the prefix
- The plugin only covers styled-components output — external stylesheets or Framer-side CSS variables remain unchanged
- **CSS variables set via inline `style` objects bypass the plugin entirely** and must be manually prefixed with `--spc-`. Currently only `src/props/buttonProps.ts` does this (`--spc-color-button-fill-hover` etc.). Any new CSS variable introduced via an inline style object must follow the same convention.
- When overriding `element.return` in the Stylis plugin, the trailing semicolon must be included explicitly — Stylis does not add it automatically when `element.return` is set.

## Alternatives considered

**Option A: Manual find-and-replace of all variable names**
Rejected: high maintenance burden; every new variable must be manually prefixed.

**Option B: Scoping to a wrapper class (`.spc-configurator { ... }` instead of `:root`)**
Rejected: more complex; requires ensuring all components render within the wrapper. Shadow DOM would have been the cleaner solution, but is ruled out.

**Option C: Shadow DOM / CSS isolation**
Rejected: the Framer application is not prepared for Shadow DOM.
