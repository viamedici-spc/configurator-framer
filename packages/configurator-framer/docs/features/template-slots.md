# Template Slots

## Goal

Enable Framer Smart Components to expose stable, index-based insertion points that can be filled from the outside.
The feature is intended for template composition in Framer where components can provide content into predefined placeholders (slots) inside a Smart Component.

## User-visible behavior

- `SetTemplateSlots` renders a `Template` and provides up to five slots: `Content 1` to `Content 5`.
- `TemplateSlot` renders the content matching its configured `Index` (`1` to `5`).
- If no matching content is provided, `TemplateSlot` renders a visible placeholder: `No content found for slot X` for easier debugging.
- Nested `SetTemplateSlots` create a new local scope, so inner templates consume the nearest slot provider.

## Edge cases / rules

- Slot matching is index-based, not name-based. This avoids dependence on Framer layer names or internal render-node structure.
- `TemplateSlot` has no children/fallback content. Missing slot content is always surfaced via the placeholder text.
- Multiple `TemplateSlot`s with the same index inside one template all receive the same content.
- The nearest `SetTemplateSlots` provider wins. Outer slot scopes do not leak through an inner `SetTemplateSlots`.

## Composition guide (consumer view)

Build a Smart Component in Framer that contains one or more `TemplateSlot` components. Assign each one an `Index` from `1` to `5`.

Then wrap that Smart Component with `SetTemplateSlots` and fill the corresponding content props.

Conceptual structure:

```tsx
<SetTemplateSlots
    template={<StyledWizardStep/>}
    content1={<StyledHeadline/>}
    content2={<StyledPrimaryAction/>}
/>
```

Inside the Smart Component template:

```tsx
<>
    <TemplateSlot index={1}/>
    <TemplateSlot index={2}/>
</>
```

## Implementation notes

- The feature is context-based, using `TemplateSlotsContext`.
- `SetTemplateSlots` provides a map of slot index to `ReactNode`.
- `TemplateSlot` reads from the nearest provider and renders the configured content directly.
