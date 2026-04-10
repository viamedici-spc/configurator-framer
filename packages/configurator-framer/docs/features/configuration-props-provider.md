# Configuration Props Provider

## Goal

Enable runtime overrides for selected `Configuration` props through a context-based provider.
The feature exists to separate two concerns that are otherwise tightly coupled in Framer:

- design-time defaults configured statically on the `Configuration` component
- runtime values decided by application logic, locale, backend responses, or other state outside Framer's static property panel

This is useful whenever the configuration setup must be chosen dynamically instead of being hardcoded into the Framer canvas.

## User-visible behavior

- `ConfigurationPropsProvider` wraps a subtree and provides override values for `Configuration`.
- A nested `Configuration` component uses the overridden values if they are present on the provider.
- If an override prop is not present on the provider, `Configuration` falls back to the prop value defined directly on the `Configuration` component.
- Overrides are applied generically by merging the provider props over the original `Configuration` props.
- The mechanism currently supports runtime overrides for session/model setup and definition props such as:
  - `hcaBaseUrl`
  - `sessionCreation`
  - `accessToken`
  - `sessionCreateUrl`
  - `sessionDeleteUrl`
  - `deploymentName`
  - `channel`
  - `attributeRelations`
  - `localization`
  - `wizardAttributeRelations`
  - `choiceValueSorting`

## Why this matters

This feature makes `Configuration` usable as a design-time shell with runtime-controlled behavior.
Typical use cases include:

- Load a different configuration model depending on the current locale.
- Fetch localization data from a backend instead of hardcoding it in Framer.
- Fetch sorting rules or wizard attribute relations from a backend or CMS.
- Prepare for runtime-defined fixed decisions, where the surrounding application decides that certain selections must always be applied.

Planned follow-up use cases are especially important here:

- Runtime fixed decisions can be injected based on locale or backend state.
- A page can decide at runtime which model to load and which decisions to pre-apply before the user starts interacting.

## Edge cases / rules

- The nearest `ConfigurationPropsProvider` wins because `Configuration` reads from the nearest React context provider.
- The provider is intended as a code-level composition primitive, not as a Framer property-control component.
- Overrides are applied as plain object assignment. If a property exists on the provider, that value is used as-is.
- This means explicitly provided values such as `null` or `undefined` are also treated as intentional overrides.
- Properties that are not part of `ConfigurationOverrideableProps` are not overridden.
- The feature does not replace the `Configuration` component. It only changes how its props are sourced at runtime.

## Composition guide (consumer view)

Use `ConfigurationPropsProvider` in a code component when the runtime layer should decide configuration inputs.

Conceptual structure:

```tsx
<ConfigurationPropsProvider
    deploymentName={resolvedDeploymentName}
    channel={resolvedChannel}
    localization={resolvedLocalization}
>
    <Configuration
        deploymentName="design-time-default"
        channel="release"
        localization={{jsonDefinition: ""}}
        {...otherStaticProps}
    >
        {children}
    </Configuration>
</ConfigurationPropsProvider>
```

Typical runtime decision patterns:

- Resolve `deploymentName` and `channel` from the active locale.
- Load `localization` from the server after page initialization.
- In the future, provide fixed decisions from the active locale or route context.

## Implementation notes

- The feature is context-based and implemented via `ConfigurationPropsProvider`.
- `Configuration` reads the context and merges the override props over its incoming props before using them.
- The merge is intentionally generic so newly supported override props can be added with minimal plumbing.
- Runtime code should work with the merged props only, so overrides are not bypassed accidentally.

## Rollout / migration notes

- Existing Framer setups remain valid. If no provider is used, `Configuration` behaves exactly as before.
- The provider is opt-in and can be introduced around specific configuration trees only.
- This is a foundation feature for future runtime capabilities, especially fixed decisions and backend-driven configuration setup.
