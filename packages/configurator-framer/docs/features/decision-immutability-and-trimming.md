# Decision Immutability and Trimming

## Goal

Surface the Configuration Engine's *Trimming* and *Decision Immutability* features in Framer components so that designers can:

- opt out of trimming (which is enabled by default both in the engine and in the Framer wrapper),
- visually distinguish the four UX states a choice value (or other attribute state) can be in: *Available*, *Fixed*, *Blocked*, *Unavailable*,
- by default, hide non-actionable *Unavailable* values from selection lists while still showing *Fixed* values, and
- compose typical filters in a list (`Available` + `Interactive`) such that *Unavailable* is implicitly excluded without a negative filter.

## Background

Two engine concepts drive this:

- **Trimming** — a session-creation option that prunes unreachable decision states. Improves performance significantly. Backend default: enabled.
- **Decision Immutability** — a per-attribute / per-choice-value flag (`isPossibleDecisionStatesImmutable`) reported by the engine on session creation. When `true`, the set of possible decision states for that attribute or choice value will not change anymore.

**Trimming does not remove attributes from the configuration model.** It only narrows their `possibleDecisionStates`, sometimes down to a single state or even the empty set. The attribute itself is always present in the tree. This matters for the UI: a component must still render a control for an
attribute whose entire state space has been trimmed away — it cannot simply disappear.

**Immutability applies to all four attribute types** (Choice, Boolean, Component, Numeric), not just choice values. Reason: when a Component attribute is trimmed (because it can only ever be Excluded), every attribute below it in the configuration tree inherits that fate — its possible decision
states collapse to whatever follows from the parent being Excluded, and that collapse is itself immutable. The same effect will appear once *Fixed Decisions* land; the UI does not need to distinguish the two sources.

### Can `possibleDecisionStates` collapse to the empty set?

| Attribute type             | Empty `possibleDecisionStates` possible? | Why                                                                                                                                                         |
|----------------------------|------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Choice (per `ChoiceValue`) | no                                       | At least *Included* or *Excluded* always remains (engine guarantee).                                                                                        |
| Component                  | no                                       | Same as choice — at least one of *Included* / *Excluded* always remains.                                                                                    |
| Boolean                    | **yes**                                  | Both `true` and `false` can be Unavailable simultaneously. Internally the decision state is then `null` (not to be confused with the engine's "Undefined"). |
| Numeric                    | **yes**                                  | When immutable and no implicit decision is set, there is simply no value.                                                                                   |

### Explain always finds a solution

For *mutably blocked* states (i.e. currently not in `possibleDecisionStates` but `!isPossibleDecisionStatesImmutable`), Explain is guaranteed to return a solution path — there are no dead ends in the engine. This is the reason mutably blocked options remain visible and clickable in the UI: the user
can always reach them via Explain. Only *immutably blocked* (Unavailable) states have no Explain solution; for those, no Explain call is made, and the corresponding controls are disabled or hidden.

## The four UX states (mental model)

Two orthogonal axes describe a choice value (or any single decision state):

|                                                           | **Available** (state ∈ `possibleDecisionStates`)                                                                  | **Blocked** (state ∉ `possibleDecisionStates`)                                                               |
|-----------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------|
| **Interactive** (`!isPossibleDecisionStatesImmutable`)    | Normal selectable case. Can change either way.                                                                    | Currently blocked, but Explain may produce a solution.                                                       |
| **Not Interactive** (`isPossibleDecisionStatesImmutable`) | **Fixed / Pinned** — implicitly set, can never flip. Typically *shown* so the user sees what's been auto-decided. | **Unavailable** — implicitly the opposite, can never become Available, no Explain helps. Typically *hidden*. |

Resulting terminology:

| Term                  | Engine condition (per state)         | Default UX in selection lists                 |
|-----------------------|--------------------------------------|-----------------------------------------------|
| **Available**         | `state ∈ possibleDecisionStates`     | Show                                          |
| **Interactive**       | `!isPossibleDecisionStatesImmutable` | Filter primitive — not directly a UX category |
| **Fixed**             | immutable ∧ available                | Show (user wants to see what is pinned)       |
| **Blocked** (mutable) | interactive ∧ ¬available             | Show (so Explain remains accessible)          |
| **Unavailable**       | immutable ∧ ¬available               | **Hide**                                      |

### Why the typical list filter is `Available ∨ Interactive`

The two-filter combination implicitly excludes Unavailable without needing a negation:

| Quadrant                                    | Matches `available`? | Matches `interactive`? | Visible? |
|---------------------------------------------|----------------------|------------------------|----------|
| Available + Interactive (normal)            | yes                  | yes                    | ✓        |
| Available + Not Interactive (**Fixed**)     | yes                  | no                     | ✓        |
| Blocked + Interactive (**Blocked**)         | no                   | yes                    | ✓        |
| Blocked + Not Interactive (**Unavailable**) | no                   | no                     | ✗        |

That keeps the filter language strictly positive while giving the user the right default behavior.

### Decision dimension (orthogonal axis)

The four states above describe a choice value purely through `possibleDecisionStates` and the immutability flag — i.e. *what could happen*. A second, orthogonal axis describes *what has happened*: the current `decision`. Two further UX-relevant terms exist on that axis:

| Term                  | Engine condition                                                          | Notes                                                                             |
|-----------------------|---------------------------------------------------------------------------|-----------------------------------------------------------------------------------|
| **Explicit Included** | `decision.kind === DecisionKind.Explicit` ∧ `decision.state === Included` | The user (or an external caller) actively set this state. Can be cleared / reset. |
| **Implicit Included** | `decision.kind === DecisionKind.Implicit` ∧ `decision.state === Included` | The engine derived this state from constraints. Cannot be cleared directly.       |

These dimensions compose freely: e.g. a *Fixed* value is by definition Implicit Included (because no other state is possible); an *Available + Interactive* value can be in any decision state including no decision at all.

#### Mutable Implicit vs. Fixed — visual differentiation in Selects / Numeric

Because *Fixed* is a strict subset of *Implicit Included* (Implicit ∧ immutable), it deserves its own visual treatment in the input/select components. The differentiation:

| Visual aspect                                                 | Mutable Implicit (Implicit ∧ ¬immutable)                                                                                                  | Fixed (Implicit ∧ immutable)          |
|---------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------|
| Option / value prefix                                         | `implicitLabelPrefix` — default `"Implicit: "`                                                                                            | `fixedLabelPrefix` — default `"📌 "`  |
| Box coloring (Choice/Boolean/Component Select, Numeric Input) | `implicitSelectedColors` — applied only when the designer explicitly sets fill/color/borderColor; otherwise visually identical to default | `fixedColors` — same opt-in semantics |

All `*Colors` props (`unsatisfiedColors`, `implicitSelectedColors`, `fixedColors`) are no-ops at the code-default level — they take effect only when the designer fills in concrete values in the Framer property panel. The repository's example configurators may set distinctive colors (e.g. a violet
for Implicit Selected) at the Framer-project level; those are not code defaults.

The select-level color predicate uses `some` over only the *mutable* implicits. A multi-select containing both a Mutable Implicit and a Fixed value still routes through the `implicitSelectedColors` branch (because the mutable one wins) — but again, only if those colors are actually set. Each
individual `<option>` carries its own appropriate prefix regardless.

## User-visible behavior

### Trimming opt-out

On the `Configuration` component a `Trimming` toggle (default `true`) controls whether the session is created with trimming enabled. When `false`, the engine returns the full, untrimmed model.

### Selection lists

Lists of choice values (e.g. `ChoiceValueList`) follow the four-state model above. The default filter set is `(included, available)` and `(included, interactive)`, combined via the existing OR semantics — Unavailable falls out implicitly.

### Selection drop-downs

`ChoiceSelect` keeps its three-bucket rendering:

1. Allowed (includes Fixed implicitly — Fixed values appear in the main list because they have `Included` in their possible states).
2. Blocked (mutable) — under the existing `<optgroup label={blockedLabel}>`. Click triggers Explain.
3. Unavailable — under a separate `<optgroup label={unavailableLabel}>` with `<option disabled>`. Hidden by default via `excludeUnavailableOptions`.

## Component contracts

### Shared: Fixed visual variant (all input components)

`InputProps` (consumed by `ChoiceSelect`, `BooleanSelect`, `ComponentSelect`, `NumericInput`) exposes:

- `fixedLabelPrefix: string` — default `"📌 "`. Per attribute prefix used when the underlying decision is *Fixed* (Implicit ∧ immutable).
- `fixedColors: InputStateColors` — optional. Background, text, and border colors for the box when at least one *Fixed* value is selected and no Mutable Implicit dominates. Defaults are empty, so without a designer override the Fixed selection visually matches an explicit selection (intentional —
  the pin prefix carries the information).

`getInputStyle` / `getSelectStyle` accept an additional `isFixedSelected: boolean` parameter and apply the new precedence: `Unsatisfied > ImplicitSelected (mutable) > FixedSelected > default`.

### Shared: Select-level immutability props (all Selects)

`SelectProps` centrally exposes the props every select needs to deal with Immutability and Unavailability. `ChoiceSelect`, `BooleanSelect`, and `ComponentSelect` all inherit these without redeclaring them locally:

- `unavailableLabel: string` — default `"Unavailable"`. Label of the Unavailable optgroup.
- `excludeUnavailableOptions: boolean` — default `true`. When `true`, the Unavailable optgroup is not rendered.
- `allOptionsBlockedColors: InputStateColors` — optional override applied when *every* option is currently blocked (mutable + immutable bundled). The select stays interactive — Explain may still reach a mutably blocked value.
- `noOptionsAvailableColors: InputStateColors` — optional override applied to the stricter case where every blocked option is *also* immutable (Unavailable). Each consuming Select additionally renders the `<select>` with `disabled` when `noOptionsAvailable && excludeUnavailableOptions === true`,
  except where the engine guarantees the state cannot arise (e.g. `ComponentSelect`).

`getSelectStyle` accepts two additional parameters, `allOptionsBlocked` and `noOptionsAvailable` (both default `false`), and applies the precedence `noOptionsAvailable > allOptionsBlocked > base style` on top of what `getInputStyle` returns.

> **Why the props live on `SelectProps`:** the rendering pattern is identical across the three Selects. Centralizing keeps the Framer property panel consistent and eliminates duplicated `getStyle` wrappers in each component. `NumericInput` is intentionally excluded — it uses `InputProps` directly
> and has no optgroup model.

### `Configuration`

- **New prop:** `trimming: boolean` — default `true`.
- **Mapping:** internally sets `disableConfigurationModelTrimming: !trimming` on the `SessionContext`. The prop is named positively so the Framer-side default reads naturally.
- **Property control:** `ControlType.Boolean` toggle (no description).

### `SelectionIndicator`

- **New `condition` value:** `"immutable"` (added to the union and to the property-control options).
- **Semantics:** matches when `isPossibleDecisionStatesImmutable === true` **and** the selected state is in `possibleDecisionStates` (i.e. the state is permanently available).
    - Choice / Boolean / Component: per-attribute or per-choice-value, depending on whether a `choiceValueId` is given (`some`/`every` according to the existing `filterMode`).
    - Numeric: matches purely on `attribute.isPossibleDecisionStatesImmutable` (numeric has no `possibleDecisionStates`).
- **Interactive is expressed through ordering, not as a separate condition.** The `find`-based priority semantics (first matching variant wins) make it idiomatic to list more specific cases (e.g. `(included, immutable)`) before generic ones (e.g. `(included, available)`).
- **`(undefined, immutable)` — Boolean and Numeric only.** Boolean and Numeric attributes can become immutable with an empty possible-decision-state set and no decision ("undefined immutable"). This variant matches `decision == null && isPossibleDecisionStatesImmutable`, letting the UI derive e.g. "`true` is unavailable" / "no numeric value can ever be set". Choice and Component cannot reach this state (the engine guarantees at least one possible state remains), so the variant is not wired for them. For a single permanently-set value, use the complementary state instead — e.g. on a Boolean where only `false` is possible and immutable, `(false, immutable)` matches and implies "`true` unavailable".
- **Priority:** `[...variants].find(...)` — first match wins. The `(undefined, immutable)` cases are registered before the generic `(undefined, *)` cases so they take precedence.

### `ChoiceValueList`

- **Filter `condition`:** `"interactive"` — predicate `!v.isPossibleDecisionStatesImmutable`.
    - Selection-agnostic: the predicate ignores the `selection` key. The schema requires a selection because of the union, but the filter behaves the same regardless of which selection it is registered under. By convention, `(included, interactive)` is the canonical form.
- **No blanket immutable-exclusion flag.** Combining `(included, available)` with `(included, interactive)` separates Fixed (shown via `available`) from Unavailable (matched by neither). A single flag would conflate the two, so the model uses the two positive filters instead.
- **Programmatic default filter set:**
  ```
  [
    { selection: "included", condition: "available" },
    { selection: "included", condition: "interactive" }
  ]
  ```
  This shows Available, Fixed, and (mutably) Blocked values; Unavailable is hidden.

### `BooleanSelect`

Inherits the shared Select-level immutability props (see *Shared: Select-level immutability props* above). Boolean-specific behavior:

- **Per-state classification.** Each of the two boolean states (`true`, `false`) is independently classified into Allowed, Blocked-mutable, or Unavailable, mirroring the `ChoiceSelect` model.
- **Rendering:**
    1. Allowed states render as regular `<option>` entries (with Fixed-prefix when applicable).
    2. Blocked-mutable states render under `<optgroup label={blockedLabel}>` — clicks trigger Explain.
    3. Unavailable states render under `<optgroup label={unavailableLabel}>` with `<option disabled>`, gated by `!excludeUnavailableOptions`.
- **Whole-element disable.** When `noOptionsAvailable && excludeUnavailableOptions === true` (both states immutable-blocked and designer opted in), the `<select>` is rendered with `disabled`. The browser's default disabled styling takes over and typically overrides `noOptionsAvailableColors`; those
  are mainly visible in the debug case (`excludeUnavailableOptions === false`). If `excludeUnavailableOptions === false`, the dropdown stays openable so the user (or a designer debugging) can inspect which values are unavailable.
- **Mutable-both-blocked is currently not reachable.** The case `allOptionsBlocked && !isPossibleDecisionStatesImmutable` — both `true` and `false` blocked, but the set could still change so Explain could resolve either — cannot be produced by the configuration model today: the constraint language
  has no way to express an implication that forces a boolean to be effectively `null`. The `allOptionsBlockedColors` code path is kept in place for forward compatibility; once the constraint language gains nullability, this case will arise organically and the styling will fire without the
  whole-element disable.
- **`onChange` Explain skip.** For an immutable + blocked value, the handler does not call Explain — the disabled `<option>` should prevent the event in the first place; this is defense-in-depth against programmatic events.

### `ComponentSelect`

Identical structure to `BooleanSelect` with `Included` / `Excluded` instead of `true` / `false`. Inherits the shared Select-level immutability props.

- **No whole-element disable.** Engine guarantee: at least one of `Included` / `Excluded` is always in `possibleDecisionStates` (this holds regardless of Trimming or Fixed Decisions). The "all Unavailable" branch is therefore unreachable for component attributes. The `allOptionsBlockedColors` /
  `noOptionsAvailableColors` props are still computed and forwarded so the shared `getSelectStyle` abstraction stays consistent across all Selects and the Framer property panel offers a uniform set of props; the styling overrides simply do not fire for `ComponentSelect`.
- **`onChange` Explain skip:** same as `BooleanSelect`.

### `NumericInput`

Numeric has no enumerable state set, so the bucket model does not apply. Instead a single rule:

- **`readOnly` when `isPossibleDecisionStatesImmutable === true`.** Value-independent — whether a decision is currently set or not. Read-only (rather than disabled) keeps the value selectable for copy/paste workflows.
- **`!isPossibleDecisionStatesImmutable`:** behaviour unchanged — user can edit, Explain runs on rejected values.
- **No new properties.**
- **Rationale.** The Fixed-vs-Unavailable distinction reduces to a single read-only state for numeric: the user cannot influence the value either way, and Explain has no useful response for an immutable numeric. The presence (Fixed) or absence (Unavailable) of an underlying decision is reflected by
  the input value the engine returns; the UI does not need to branch on it.

### `ChoiceSelect`

Inherits the shared Select-level immutability props (see *Shared: Select-level immutability props* above). **Note:** the rename `noOptionsAvailableColors` → semantic shift is the only breaking change in this feature — see *Rollout / migration notes*. ChoiceSelect-specific behavior:

- **Rendering pipeline:**
    1. `getBlockedChoiceValues()` is called once.
    2. Result is split into `blockedChoiceValues` (mutable) and `unavailableChoiceValues` (immutable), each sorted via `useSortedChoiceValues`.
    3. `<optgroup label={blockedLabel}>` renders the mutable group (existing behavior — clicks trigger Explain).
    4. `<optgroup label={unavailableLabel}>` renders the unavailable group, but **only when `excludeUnavailableOptions === false`**. Each entry is `<option disabled>`.
- **Click behavior:** the `disabled` attribute prevents the browser from selecting an unavailable option. If a programmatic event still fires, the `onChange` handler short-circuits — unavailable IDs are in neither the allowed nor the blocked list.
- **Whole-element disable.** When `allOptionsBlocked && blockedChoiceValues.length === 0 && excludeUnavailableOptions === true` (every value is immutable-blocked and the designer opted in), the `<select>` is rendered with `disabled`. With `excludeUnavailableOptions === false` (debug view), the
  dropdown stays openable and `noOptionsAvailableColors` apply.

## Edge cases / rules

- A choice value that is Available *and* immutable (Fixed) renders normally in the allowed list / passes through `available`-based filters. The implicit-prefix logic handles its display.
- A choice value with empty `possibleDecisionStates` should not occur in practice — it would have been trimmed.
- The `interactive` predicate does not depend on the selection state, so registering it under different selections produces identical matches. We standardize on `selection: "included"` as the canonical form.
- Boolean / Component / Numeric attributes can also report `isPossibleDecisionStatesImmutable === true` when their values have been collapsed by Trimming or Fixed Decisions. The `SelectionIndicator` already handles those via `condition: "immutable"`. The corresponding Select / Input components for
  those types will gain matching states in a follow-up — see the in-code design notes in `SelectionIndicator.tsx`.

## Architectural notes

### Immutability helpers stay in the Framer layer

Helpers like `getImmutableChoiceValues` or an `excludeImmutable` parameter on `getBlockedChoiceValues` live only in this Framer package, not in `configurator-react` / `configurator-ts`. Filtering on `isPossibleDecisionStatesImmutable` is a one-liner at the consumer; pushing it down would require a
coordinated three-package release without a corresponding gain in reuse. Promote later if another consumer needs the same logic.

### Naming

- The engine flag stays `isPossibleDecisionStatesImmutable` — internal terminology mirrors that.
- UX-facing terms are deliberately distinct:
    - **Available / Blocked** describe whether a state is currently in `possibleDecisionStates`.
    - **Interactive** describes whether the set can still change (i.e. `!immutable`).
    - **Fixed** is the implicit term for *immutable + available* — a state that is permanently set.
    - **Unavailable** is the implicit term for *immutable + blocked* — a state that can never be reached.

## Rollout / migration notes

- All new props are additive with sensible defaults — no existing Framer designs change behavior unless the underlying model contains immutable states. In that case the *Unavailable* values are hidden by default (in `ChoiceSelect` / `BooleanSelect` / `ComponentSelect` via
  `excludeUnavailableOptions: true`; in `ChoiceValueList` via the default `available + interactive` filter combination).

### ⚠️ Breaking change: `ChoiceSelect.noOptionsAvailableColors` — semantic shift

**This must be called out in the release changelog as a breaking change with explicit migration guidance.** The prop name `noOptionsAvailableColors` stays the same, but its trigger condition has narrowed. Designers who previously set this prop will continue to see their colors stored against the
same property in Framer — but those colors will now apply in a strictly smaller set of cases than before. To keep the previous behavior, designers must explicitly copy their values to the newly added `allOptionsBlockedColors` prop.

**What changed semantically.**

- **Before:** `noOptionsAvailableColors` was triggered by `allowedChoiceValues.length === 0` — i.e. "no option can be chosen right now", regardless of why. Pre-Immutability there was only one reason: all values mutably blocked, with Explain potentially helping.
- **After:** `noOptionsAvailableColors` is triggered by the stricter `allowedChoiceValues.length === 0 && blockedChoiceValues.length === 0` — i.e. every blocked value is also immutable (Unavailable). Explain cannot help; the select may additionally be `disabled` (depending on
  `excludeUnavailableOptions`).
- A new prop `allOptionsBlockedColors` carries the broader pre-Immutability semantic.

**Migration matrix for Framer designers** (per `ChoiceSelect` instance):

| Designer's intent                                                                         | Pre-upgrade prop             | Action after upgrade                                                                                                                                   |
|-------------------------------------------------------------------------------------------|------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------|
| "Highlight the select when no option can be chosen (any reason)"                          | `noOptionsAvailableColors`   | Copy the values to **`allOptionsBlockedColors`**. Leave `noOptionsAvailableColors` empty unless you also want the stricter (immutable-only) highlight. |
| "Highlight only when nothing is reachable even via Explain (the immutable dead-end case)" | n/a — not expressible before | Set **`noOptionsAvailableColors`** to the colors you want.                                                                                             |
| "Both" (different colors for the two sub-cases)                                           | n/a                          | Set both props; `noOptionsAvailableColors` wins where both conditions hold.                                                                            |

Framer does not auto-migrate property values between prop names, so a designer who simply upgrades and re-opens the project will see their old `noOptionsAvailableColors` setting still in place — but visually applied much less often than before.

**Changelog entry suggestion.**
> **Breaking change.** `ChoiceSelect.noOptionsAvailableColors` changed its trigger condition. The prop now applies only when every blocked value is also immutable (the new *Unavailable* case). The previous broader behavior — applying whenever no value can be chosen — is now expressed by the new
`allOptionsBlockedColors` prop. If your existing designs relied on the broader behavior, copy your colors from `noOptionsAvailableColors` to `allOptionsBlockedColors`. See feature doc: `decision-immutability-and-trimming.md`.

## Files touched

- `src/components/Configuration.tsx` — `trimming` prop, `disableConfigurationModelTrimming` mapping, property control.
- `src/components/SelectionIndicator.tsx` — `"immutable"` condition + 7 pattern cases (Choice ×2, Boolean ×2, Component ×2, Numeric ×1).
- `src/components/ChoiceValueList.tsx` — `"interactive"` filter condition, default filter set `[(included, available), (included, interactive)]`.
- `src/components/ChoiceSelect.tsx` — split rendering with `<option disabled>`, Fixed prefix routing, whole-element `disabled` when `excludeUnavailableOptions && no options available`. **`noOptionsAvailableColors` semantic shift (breaking — see migration matrix).** Local `getStyle` wrapper removed
  in favor of the shared `getSelectStyle`.
- `src/components/BooleanSelect.tsx` — three-bucket rendering, conditional whole-element disable, Fixed prefix routing, full parity via `SelectProps` (no own color/label props anymore).
- `src/components/ComponentSelect.tsx` — three-bucket rendering, Fixed prefix routing, full parity via `SelectProps`. Whole-element disable not wired (engine guarantees at least one state remains).
- `src/components/NumericInput.tsx` — `readOnly` when immutable, Fixed prefix routing.
- `src/props/inputProps.tsx` — `fixedLabelPrefix`, `fixedColors`, `getInputStyle` extended with `isFixedSelected`.
- `src/props/selectProps.tsx` — central home for `unavailableLabel`, `excludeUnavailableOptions`, `allOptionsBlockedColors`, `noOptionsAvailableColors`. `getSelectStyle` extended with `isFixedSelected`, `allOptionsBlocked`, `noOptionsAvailable` and the priority chain.
