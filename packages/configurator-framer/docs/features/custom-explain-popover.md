# Custom Explain Popover

## Goal
Enable fully custom Explain popovers in Framer by exposing unstyled, logic-driven building blocks (renderers + actions) that can be composed with Smart Components. The intent is to let designers build anything from highly technical UI (compact, data-dense) to more descriptive, guidance-heavy experiences, all with their own structure, wording, and styling.

## User-visible behavior
- When Explain is triggered, the popover can render a fully custom layout instead of the styled default.
- Designers can supply their own templates for question header, attribute list rows, attribute value rows, and action elements.
- The custom popover can be enabled via `useCustomPopover` on `ExplainPopoverProps` and `customExplainPopover` on `Configuration`.

## Edge cases / rules
- Custom content is responsible for including the `CustomExplainPopover` component so the explain context is set and error/no-solution states are handled.
- Attribute/decision lists are sorted deterministically based on the display name, also used in the styled variant.
- Renderer templates receive only primitive props to stay Framer-friendly.

## Composition guide (consumer view)
Custom Explain is built from logic-only building blocks. You provide Smart Components as templates and expose the props the renderers pass in. In the sections below, these are referred to as **Styled Smart Components** (the components you create in Framer).
For additional control, you can also build custom **Code Components** in Framer and use them as templates.

Minimal JSX structure (conceptual):
```tsx
<Configuration customExplainPopover={
  <CustomExplainPopover
    content={
      <>
        <CustomExplainQuestion template={<StyledExplainQuestion />} />
        <CustomExplainAttributeList itemTemplate={<StyledExplainAttribute />}>
          <CustomExplainAttributeValueList itemTemplate={<StyledExplainAttributeValue />} />
        </CustomExplainAttributeList>
        <CustomExplainApplySolution content={<StyledApplySolutionButton />} />
      </>
    }
    failedToExplainContent={<StyledExplainErrorMessage />}
    noExplanationFoundContent={<StyledNoExplanationFoundMessage />}
    noSolutionFoundContent={<StyledNoExplainSolutionFoundMessage />}
  />
} />
```

### Building blocks + template props
Each building block is a component that expects a **Styled Smart Component**. The Styled Smart Component only receives the props it declares.

| Component | Purpose | Props (can accept) | Styled Smart Component assigned via |
| --- | --- | --- | --- |
| `CustomExplainQuestion` | Communicates *what is being explained* (e.g., “Color Red is blocked” or “Configuration is not satisfied”). Best practice is to make the explained subject explicit, usually as the popover header. | - question: `"why-is-not-satisfied"` \| `"why-is-state-not-possible"`<br>- subject: `"configuration"` \| `"attribute"` \| `"choice-value"` \| `"component"` \| `"boolean"` \| `"numeric"`<br>- attributeId: `string`<br>- componentPath: `string`<br>- sharedConfigurationModel: `string`<br>- choiceValueId: `string`<br>- value: `"included"` \| `"excluded"` \| `"true"` \| `"false"` \| `""`<br>- numericValue: `number` \| `null` | `Template` |
| `CustomExplainAttributeList` | Represents a single attribute row (typically a row in a list), combining the attribute name and its value decisions. | - attributeId: `string`<br>- componentPath: `string`<br>- sharedConfigurationModel: `string`<br>- attributeName: `string` | `Attribute Template` |
| `CustomExplainAttributeValueList` | Represents a single decision/value badge within an attribute row (what will be added or removed if the solution is applied). Use `intention` to distinguish add/remove states for clear user feedback. | - displayName: `string`<br>- intention: `"add"` \| `"remove"` | `Attribute Value Template` |
| `CustomExplainApplySolution` | Triggers applying the shown solution (often rendered as a button). | — | `Content` |

Notes:
- Only primitive props are passed into templates (Framer-friendly).
- If your template does not declare the expected props, it won’t receive the data.

## Rollout / migration notes
- Existing styled popovers remain default; custom popovers are opt-in.
- Custom components are exported with `CustomExplain*` prefixes.
