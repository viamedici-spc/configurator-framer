# ADR 0002: No Regular Suspense Boundary Around Framer Content After Initialization
Date: 2026-10-13

## Context

`Configuration` renders Framer canvas content (its `children`) and used to wrap it in a plain `<Suspense>`.
That boundary exists for configurator-react's suspended hooks, which suspend until the configuration is initialized.

Framer wraps every code component in its own boundary (`SuspenseThatPreservesDOM`).
On a published site, its fallback does not render anything: it throws a promise that never resolves.
The suspension is handed up until it reaches Framer's root, where React keeps the current page and waits for the original promise.
For synchronous updates (e.g. a state change in a click handler), Framer's `SynchronousSuspenseErrorBoundary` instead switches its boundaries to regular fallbacks and logs a recoverable error.
This switch is global and stays active until the page is loaded again.
When the configurator is embedded natively into a host page, that is the host page.

A regular boundary between Framer's boundaries and its root breaks this.
It catches the never-resolving promise, commits its fallback, and only retries when that promise resolves, which never happens.
The original promise is attached to Framer's inner boundary, which never commits, so nothing retries.
The configurator content stays blank, without any error.

This became visible when Framer started to load the translations of smart components lazily, one file per locale (`<componentId>-0.mjs`, `-1.mjs`, ...).
On every locale except the default one, a smart component suspends the first time it renders in the browser.
Content that mounts after hydration inside `Configuration` (wizard steps, dialogs, conditional content) then never shows up.

## Decision

`Configuration` wraps its content in `InitializationSuspense` instead of `<Suspense>`.

- While the configuration is initializing (`useConfigurationInitialization().isInitializing`), the fallback is empty, as before.
- Once initialized, the fallback throws a promise as well, so every suspension is handed on to Framer.
- That promise resolves after 100 ms. Framer's root waits for the original promise anyway.
  But once Framer has switched to regular fallbacks, the boundary above `Configuration` catches this promise and has to retry instead of waiting forever.
- When initialization completes, the boundary re-renders and retries its content, which also recovers from a Framer suspension that arrived during initialization.

**Affected files:**
- `src/components/InitializationSuspense.tsx`
- `src/components/Configuration.tsx`
- `tests/initializationSuspense.test.tsx`

## Consequences

**Positive:**
- Content inside `Configuration` follows Framer's suspense behavior: after initialization, the current content stays visible until new content is ready.
- Projects no longer need a workaround per component (e.g. a remounting `Suspense` around wizard steps).

**Risks / Trade-offs:**
- A suspension in a synchronous update (e.g. a click handler that mounts a smart component for the first time) triggers Framer's recoverable-error path: a console warning and a short local flash.
  Projects should wrap such state changes in `startTransition`, as Framer recommends.
- Do not add a regular `<Suspense>` boundary around Framer content inside the configurator; it brings back the deadlock.
- While a handed-on suspension is pending, React retries about every 100 ms until the content is ready.
- Relies on Framer's root handling suspensions; verify after Framer runtime or React upgrades.
  Last verified against Framer's published runtime with React 18.3.1 in October 2026.
- configurator-framer is only meant to run inside Framer's runtime.
  Outside of it (plain React), a handed-on suspension reaches the host's own boundaries or its root, and a suspension in a synchronous update ends in the error boundary of `Configuration`.
  Using the library outside of Framer requires revisiting this decision.

## Alternatives considered

**Option A: Remove the boundary**
Rejected: configurator-react's `Configuration` creates its atoms in `useMemo`.
Without a boundary that commits during initialization, every retry creates new atoms and a new session, in an endless loop, and the content stays blank.

**Option B: A boundary that retries its content on every animation frame**
Rejected: it fixes the blank content, but every step switch blanks the whole configurator for about 0.6 s.

**Option C: Hand on a never-resolving promise, like Framer's own fallback**
Rejected: once Framer has switched to regular fallbacks, the boundary above `Configuration` catches the never-resolving promise and waits forever.
The blank content then comes back one level higher, for any content that suspends directly inside `Configuration` instead of inside a Framer code boundary.
