# Host Parameters

## Goal

Let the host page that embeds the configurator pass arbitrary runtime context into it as a
string→string dictionary — for example a configuration model id, a region, or whether the
configurator runs inside a webshop. The configurator reads these values through a single React
hook that **hot-reloads**: when the host changes a parameter at runtime, the hook re-renders
without reloading the page.

The mechanism is transparent across both embedding modes of
[`@viamedici-spc/configurator-framer-host`](https://www.npmjs.com/package/@viamedici-spc/configurator-framer-host):

- **Native** (direct DOM): the parameters live as `data-*` attributes on the
  `spc-embedded-configurator-native` host element; the hook reads and observes them directly.
- **Iframe** (isolated): the parameters are exchanged via `postMessage`; the hook performs a
  handshake with the host and listens for pushed updates.

Detection is automatic — there is nothing to configure, and no origins to declare.

## Host side

The host sets `data-*` attributes on the web component (the `data-` prefix is stripped to form
the parameter key):

```html
<spc-embedded-configurator
        src="https://example.framer.app"
        data-configuration-model-id="root-de"
        data-region="eu"
        data-webshop="true"/>
```

Keys are lowercased by the browser, so `data-configuration-model-id` arrives as
`configuration-model-id`. Values are always strings.

## API

```ts
import {useHostParameters, useHostParameter, HostParametersProvider} from "@viamedici-spc/configurator-framer";

useHostParameters(): Record<string, string>   // the whole dictionary
useHostParameter(key: string): string | undefined  // a single value
```

`Configuration` already wraps its subtree with `HostParametersProvider`, so any component **inside**
the configurator can read parameters with zero setup. Place `HostParametersProvider` as an outer
wrapper yourself only when a parameter must be available **above** `Configuration`.

The provider is **nesting-aware**: the outermost instance owns the single store, and any nested
provider (e.g. `Configuration`'s built-in wrap) becomes a pass-through that inherits it. So nesting
an outer provider around `Configuration` does not create a second store — there is always exactly
one transport (observer / message listener / handshake).

## Usage

### Read a parameter inside the configurator (webshop toggle)

```tsx
import {useHostParameter} from "@viamedici-spc/configurator-framer";

function AddToCartButton() {
    const isWebshop = useHostParameter("webshop") === "true"; // values are strings
    if (!isWebshop) return null;
    return <button onClick={/* cart integration */}>Add to cart</button>;
}
```

### Drive `deploymentName` from a parameter

Because the auto-wrapped provider lives *inside* `Configuration`, it cannot feed `Configuration`'s
own session setup. To source `deploymentName` (or `channel`, …) from a parameter, place an **outer**
`HostParametersProvider` and bridge the value through
[`ConfigurationPropsProvider`](./configuration-props-provider.md):

```tsx
import {HostParametersProvider, ConfigurationPropsProvider, useHostParameter} from "@viamedici-spc/configurator-framer";

function DeploymentFromParameter({children}: React.PropsWithChildren) {
    const deploymentName = useHostParameter("configuration-model-id");
    return (
        <ConfigurationPropsProvider deploymentName={deploymentName}>
            {children}
        </ConfigurationPropsProvider>
    );
}

// Composition (outermost → innermost):
// <HostParametersProvider>
//   <DeploymentFromParameter>
//     <Configuration …>{/* configurator UI */}</Configuration>
//   </DeploymentFromParameter>
// </HostParametersProvider>
```

When the host changes the parameter at runtime, the hook re-renders, the override changes, and
`Configuration` re-initializes the session with the new model — without a page reload.

## Notes

- Values are always strings; serialize booleans/numbers on the host and compare as strings
  (`=== "true"`).
- Comparison is shallow; the hook re-renders only when the set of parameters actually changes.
- Standalone (no embedding host): the hooks return an empty dictionary.
- The prefix and message-type constants are duplicated in the host package
  (`src/parameters.ts`) and here (`src/common/hostParametersStore.ts`) — the two packages share no
  module, so keep them in sync.
