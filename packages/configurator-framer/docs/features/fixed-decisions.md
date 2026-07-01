# Fixed Decisions

## Goal

Let a Framer user specify **fixed decisions** on the root `Configuration` component. Fixed decisions are passed
*once*, when the configuration session is created, and stay **immutable** for the session's lifetime — the end
user cannot change or clear them. The engine treats them like constraints and **trims** the model to them, so
states that contradict the fixed decisions disappear.

Typical use case: lock a **Sales Region** (or any context/QA-bound value) so everything incompatible collapses.

This is the *input* counterpart to [Decision Immutability and Trimming](./decision-immutability-and-trimming.md).
The consequence-side UX (Fixed / Unavailable / immutable states, the 📌 prefix, hidden Unavailable values) is
already handled there and keys off the same `isPossibleDecisionStatesImmutable` flag — **nothing new is needed
on the consequence side.** This feature only adds the ability to *declare* the fixed decisions.

## User-visible behavior

- The `Configuration` component gains a **Fixed Decisions** property — a top-level array of decision items,
  entered directly through Framer's native property-controls UI (no JSON). Fixed decisions are usually few.
- Each list item has these fields: `Attribute Id`, `Component Path`, `Shared Configuration Model`,
  `Choice Value Id`, a `State` enum, and `Numeric Value`.
- The `State` enum is `included | excluded | true | false | numeric` — **without `undefined`**, because a fixed
  decision requires a concrete value (there is no reset).
- Once set, the fixed value surfaces as an *implicit*, immutable decision and its dependents are trimmed; the
  end user sees it rendered through the existing Fixed/Unavailable UX.
- Changing a fixed decision **re-creates the session** (the value is baked into the `SessionContext`).
- Fixed decisions also flow through `ConfigurationPropsProvider` — a host/parent can inject them per instance
  (e.g. from a host parameter), just like `attributeRelations` and the other overrideable session props.

### Injecting fixed decisions at runtime (`ConfigurationPropsProvider`)

`fixedDecisions` is part of `ConfigurationOverrideableProps`, so a parent can override whatever is configured on
the canvas by wrapping `Configuration` in a `ConfigurationPropsProvider`. The provider's value wins over the
panel props (`Object.assign({}, props, propOverrides)`), and because a new array is a referential change that is
a dependency of the `SessionContext`, the session is **re-created** whenever the injected value changes.

Type the override with the exported `ConfigurationPropOverrides` (there is no separate item-type export — this
mirrors the other overrideable structured props). The injected shape is the raw item shape; `Configuration`
maps it to domain `FixedDecision`s internally.

```tsx
import {ConfigurationPropsProvider, ConfigurationPropOverrides} from "@viamedici-spc/configurator-framer";

function FixedRegion({region, children}: React.PropsWithChildren<{region: string}>) {
    const overrides: ConfigurationPropOverrides = {
        fixedDecisions: region
            ? [{
                attributeId: "SalesRegion",
                sharedConfigurationModel: "SalesShared",
                componentPath: "",
                choiceValueId: region,
                state: "included",
                numericValue: 0,
            }]
            : [] // empty ⇒ no fixed decision is sent
    };

    return <ConfigurationPropsProvider {...overrides}>{children}</ConfigurationPropsProvider>;
}

// <FixedRegion region={region}><Configuration …>…</Configuration></FixedRegion>
// Changing `region` swaps the array reference ⇒ the session is re-created with the new fixed decision.
```

The `region` value can come from anywhere (component state, routing, a host parameter, …). To source it from a
host parameter, resolve it with `useHostParameter` under a `HostParametersProvider` and pass it down — see
[Host Parameters](./host-parameters.md).

## Edge cases / rules

- **Attribute type is derived from props, not the session.** Fixed decisions are built while constructing the
  `SessionContext`, *before* any session exists, so — unlike `Set Selections` — the type cannot be resolved via
  `useAttributes()`. It is inferred from the item alone:

  | `State`                 | `Choice Value Id` | → Fixed decision                                    |
  |-------------------------|-------------------|-----------------------------------------------------|
  | `included` / `excluded` | non-empty         | `Choice`  (`state: Included/Excluded`)              |
  | `included` / `excluded` | empty             | `Component` (`state: Included/Excluded`)            |
  | `true` / `false`        | —                 | `Boolean` (`state: true/false`)                     |
  | `numeric`               | —                 | `Numeric` (`state: Numeric Value`)                  |
  | anything else / empty `Attribute Id` | —    | item is ignored (omitted)                           |

  A Choice decision always carries a `Choice Value Id`; a Component decision never does — that presence is what
  disambiguates the shared `included`/`excluded` states.
- **Empty = omit.** An empty list (or a list where every item is ignored) resolves to `null`, so no
  `fixedDecisions` is sent — matching the engine contract (do not send meaningless empty entries).
- **No "undefined"/reset.** Enforced both by the `State` enum options and by the strict, non-nullable
  `FixedDecision` domain type (compile-time).
- **Invalid input fails session creation.** A value that doesn't exist in the model, or a contradiction, makes
  the engine reject session creation with `FixedDecisionsInvalid` (HTTP 409). This is surfaced through the
  existing `InitializationError` display (see below).

## Flow (sequence)

1. Designer adds fixed-decision items in the `Configuration` property panel (or a host injects them via
   `ConfigurationPropsProvider`).
2. `Configuration` merges prop overrides, then maps each raw item to a `FixedDecision` via
   `mapFixedDecision` (`props/fixedDecisionsProps.ts`), filtering out ignored items; an empty result ⇒ `null`.
3. The mapped array is memoized and placed on the `SessionContext` (`fixedDecisions`), which is a dependency of
   the session — a change re-creates the session.
4. The engine validates and trims: success ⇒ fixed values render as immutable/Fixed and dependents are trimmed;
   failure ⇒ `FixedDecisionsInvalid` shown by `InitializationError`.

## Rollout / migration notes

- Dependency `@viamedici-spc/configurator-react` bumped `4.0.0` → `4.2.0` in both `configurator-framer` and
  `configurator-framer-bundle`. No consumer-facing breaking change; the new property is optional.

## Files touched

- `src/props/fixedDecisionsProps.ts` — item props, native property controls, `mapFixedDecision` mapper (new)
- `src/components/Configuration.tsx` — prop intersect, overrideable pick, mapping into `SessionContext`,
  property-control spread
- `src/components/InitializationError.tsx` — `FixedDecisionsInvalid` case
- `package.json` (both packages) — dependency bump
