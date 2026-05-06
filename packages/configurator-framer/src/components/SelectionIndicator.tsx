import {addPropertyControls, ControlType, PropertyControls} from "framer"
import {useAttributes} from "@viamedici-spc/configurator-react"
import useRenderPlaceholder from "../hooks/useRenderPlaceholder";
import parseGlobalAttributeId from "../common/parseGlobalAttributeId";
import {forwardRef, ReactNode} from "react";
import {attributeIdPropertyControls, AttributeIdProps} from "../props/attributeIdProps";
import {choiceValueIdPropertyControls, ChoiceValueIdProps} from "../props/choiceValueIdProps";
import {match} from "ts-pattern";
import {AttributeType, ChoiceAttribute, ChoiceValue, ChoiceValueDecisionState, ComponentDecisionState, DecisionKind} from "@viamedici-spc/configurator-ts";
import withErrorBoundary from "../common/withErrorBoundary";
import cloneChildrenWithProps from "../common/cloneChildrenWithProps";

type SelectionState = "undefined" | "included" | "excluded" | "true" | "false" | "numeric";
type Condition = "none" | "explicit" | "implicit" | "blocked" | "available" | "immutable";
type FilterMode = "some" | "every"

type Variant = {
    selection: SelectionState,
    condition: Condition,
    content: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10,
    useInDesignTime: boolean
}

type Props = AttributeIdProps & ChoiceValueIdProps & {
    filterMode: FilterMode
    variants: Variant[],
    content1: ReactNode,
    content2: ReactNode,
    content3: ReactNode,
    content4: ReactNode,
    content5: ReactNode,
    content6: ReactNode,
    content7: ReactNode,
    content8: ReactNode,
    content9: ReactNode,
    content10: ReactNode
}

/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 */
const SelectionIndicator = withErrorBoundary(forwardRef<HTMLElement, Props>(function SelectionIndicator(props, ref) {
    const getContent = (i: number): ReactNode => match(i)
        .with(1, () => props.content1)
        .with(2, () => props.content2)
        .with(3, () => props.content3)
        .with(4, () => props.content4)
        .with(5, () => props.content5)
        .with(6, () => props.content6)
        .with(7, () => props.content7)
        .with(8, () => props.content8)
        .with(9, () => props.content9)
        .with(10, () => props.content10)
        .otherwise(() => null);

    const designTimeVariant = props.variants.find(v => v.useInDesignTime) || props.variants[0];
    const renderPlaceholder = useRenderPlaceholder();
    if (renderPlaceholder) {
        return designTimeVariant && getContent(designTimeVariant.content);
    }

    const globalAttributeId = parseGlobalAttributeId(props);
    const choiceValueId = props.choiceValueId ?? "";
    const hasChoiceValueId = choiceValueId.length > 0;
    const attribute = useAttributes([globalAttributeId], false)[0];

    if (!attribute) {
        return <span>Attribute not found</span>;
    }

    const isChoiceAttribute = attribute.type === AttributeType.Choice;

    if (!isChoiceAttribute && hasChoiceValueId) {
        return <span>Attribute is not a Choice Attribute</span>;
    }

    const choiceValue: ChoiceValue = isChoiceAttribute && hasChoiceValueId ? attribute.values.get(choiceValueId) : null;
    if (hasChoiceValueId && choiceValue == null) {
        return <span>Choice Value not found</span>;
    }

    const evaluateChoiceAttribute = (predicate: (v: ChoiceValue) => boolean) => () =>
        choiceValue ? predicate(choiceValue) : match(props.filterMode)
            .with("some", () => [...(attribute as ChoiceAttribute).values.values()].some(predicate))
            .with("every", () => [...(attribute as ChoiceAttribute).values.values()].every(predicate))
            .exhaustive()

    const variant = [...props.variants]
        .find(({selection, condition}) => match({selection, condition, attribute})
            // Choice
            .with({attribute: {type: AttributeType.Choice}, selection: "included", condition: "blocked"}, evaluateChoiceAttribute(v => !v.possibleDecisionStates.includes(ChoiceValueDecisionState.Included)))
            .with({attribute: {type: AttributeType.Choice}, selection: "included", condition: "available"}, evaluateChoiceAttribute(v => v.possibleDecisionStates.includes(ChoiceValueDecisionState.Included)))
            .with({attribute: {type: AttributeType.Choice}, selection: "included", condition: "immutable"}, evaluateChoiceAttribute(v => v.isPossibleDecisionStatesImmutable && v.possibleDecisionStates.includes(ChoiceValueDecisionState.Included)))
            .with({attribute: {type: AttributeType.Choice}, selection: "included", condition: "implicit"}, evaluateChoiceAttribute(v => v.decision?.state === ChoiceValueDecisionState.Included && v.decision?.kind === DecisionKind.Implicit))
            .with({attribute: {type: AttributeType.Choice}, selection: "included", condition: "explicit"}, evaluateChoiceAttribute(v => v.decision?.state === ChoiceValueDecisionState.Included && v.decision?.kind === DecisionKind.Explicit))
            .with({attribute: {type: AttributeType.Choice}, selection: "included", condition: "none"}, evaluateChoiceAttribute(v => v.decision?.state === ChoiceValueDecisionState.Included))

            .with({attribute: {type: AttributeType.Choice}, selection: "excluded", condition: "blocked"}, evaluateChoiceAttribute(v => !v.possibleDecisionStates.includes(ChoiceValueDecisionState.Excluded)))
            .with({attribute: {type: AttributeType.Choice}, selection: "excluded", condition: "available"}, evaluateChoiceAttribute(v => v.possibleDecisionStates.includes(ChoiceValueDecisionState.Excluded)))
            .with({attribute: {type: AttributeType.Choice}, selection: "excluded", condition: "immutable"}, evaluateChoiceAttribute(v => v.isPossibleDecisionStatesImmutable && v.possibleDecisionStates.includes(ChoiceValueDecisionState.Excluded)))
            .with({attribute: {type: AttributeType.Choice}, selection: "excluded", condition: "implicit"}, evaluateChoiceAttribute(v => v.decision?.state === ChoiceValueDecisionState.Excluded && v.decision?.kind === DecisionKind.Implicit))
            .with({attribute: {type: AttributeType.Choice}, selection: "excluded", condition: "explicit"}, evaluateChoiceAttribute(v => v.decision?.state === ChoiceValueDecisionState.Excluded && v.decision?.kind === DecisionKind.Explicit))
            .with({attribute: {type: AttributeType.Choice}, selection: "excluded", condition: "none"}, evaluateChoiceAttribute(v => v.decision?.state === ChoiceValueDecisionState.Excluded))

            // Boolean
            .with({attribute: {type: AttributeType.Boolean}, selection: "true", condition: "blocked"}, ({attribute}) => !attribute.possibleDecisionStates.includes(true))
            .with({attribute: {type: AttributeType.Boolean}, selection: "true", condition: "available"}, ({attribute}) => attribute.possibleDecisionStates.includes(true))
            .with({attribute: {type: AttributeType.Boolean}, selection: "true", condition: "immutable"}, ({attribute}) => attribute.isPossibleDecisionStatesImmutable && attribute.possibleDecisionStates.includes(true))
            .with({attribute: {type: AttributeType.Boolean}, selection: "true", condition: "implicit"}, ({attribute}) => attribute.decision?.state === true && attribute.decision?.kind === DecisionKind.Implicit)
            .with({attribute: {type: AttributeType.Boolean}, selection: "true", condition: "explicit"}, ({attribute}) => attribute.decision?.state === true && attribute.decision?.kind === DecisionKind.Explicit)
            .with({attribute: {type: AttributeType.Boolean}, selection: "true", condition: "none"}, ({attribute}) => attribute.decision?.state === true)

            .with({attribute: {type: AttributeType.Boolean}, selection: "false", condition: "blocked"}, ({attribute}) => !attribute.possibleDecisionStates.includes(false))
            .with({attribute: {type: AttributeType.Boolean}, selection: "false", condition: "available"}, ({attribute}) => attribute.possibleDecisionStates.includes(false))
            .with({attribute: {type: AttributeType.Boolean}, selection: "false", condition: "immutable"}, ({attribute}) => attribute.isPossibleDecisionStatesImmutable && attribute.possibleDecisionStates.includes(false))
            .with({attribute: {type: AttributeType.Boolean}, selection: "false", condition: "implicit"}, ({attribute}) => attribute.decision?.state === false && attribute.decision?.kind === DecisionKind.Implicit)
            .with({attribute: {type: AttributeType.Boolean}, selection: "false", condition: "explicit"}, ({attribute}) => attribute.decision?.state === false && attribute.decision?.kind === DecisionKind.Explicit)
            .with({attribute: {type: AttributeType.Boolean}, selection: "false", condition: "none"}, ({attribute}) => attribute.decision?.state === false)

            // Component
            .with({attribute: {type: AttributeType.Component}, selection: "included", condition: "blocked"}, ({attribute}) => !attribute.possibleDecisionStates.includes(ComponentDecisionState.Included))
            .with({attribute: {type: AttributeType.Component}, selection: "included", condition: "available"}, ({attribute}) => attribute.possibleDecisionStates.includes(ComponentDecisionState.Included))
            .with({attribute: {type: AttributeType.Component}, selection: "included", condition: "immutable"}, ({attribute}) => attribute.isPossibleDecisionStatesImmutable && attribute.possibleDecisionStates.includes(ComponentDecisionState.Included))
            .with({attribute: {type: AttributeType.Component}, selection: "included", condition: "implicit"}, ({attribute}) => attribute.decision?.state === ComponentDecisionState.Included && attribute.decision?.kind === DecisionKind.Implicit)
            .with({attribute: {type: AttributeType.Component}, selection: "included", condition: "explicit"}, ({attribute}) => attribute.decision?.state === ComponentDecisionState.Included && attribute.decision?.kind === DecisionKind.Explicit)
            .with({attribute: {type: AttributeType.Component}, selection: "included", condition: "none"}, ({attribute}) => attribute.decision?.state === ComponentDecisionState.Included)

            .with({attribute: {type: AttributeType.Component}, selection: "excluded", condition: "blocked"}, ({attribute}) => !attribute.possibleDecisionStates.includes(ComponentDecisionState.Excluded))
            .with({attribute: {type: AttributeType.Component}, selection: "excluded", condition: "available"}, ({attribute}) => attribute.possibleDecisionStates.includes(ComponentDecisionState.Excluded))
            .with({attribute: {type: AttributeType.Component}, selection: "excluded", condition: "immutable"}, ({attribute}) => attribute.isPossibleDecisionStatesImmutable && attribute.possibleDecisionStates.includes(ComponentDecisionState.Excluded))
            .with({attribute: {type: AttributeType.Component}, selection: "excluded", condition: "implicit"}, ({attribute}) => attribute.decision?.state === ComponentDecisionState.Excluded && attribute.decision?.kind === DecisionKind.Implicit)
            .with({attribute: {type: AttributeType.Component}, selection: "excluded", condition: "explicit"}, ({attribute}) => attribute.decision?.state === ComponentDecisionState.Excluded && attribute.decision?.kind === DecisionKind.Explicit)
            .with({attribute: {type: AttributeType.Component}, selection: "excluded", condition: "none"}, ({attribute}) => attribute.decision?.state === ComponentDecisionState.Excluded)

            // Numeric
            .with({attribute: {type: AttributeType.Numeric}, selection: "numeric", condition: "implicit"}, ({attribute}) => attribute.decision?.kind === DecisionKind.Implicit)
            .with({attribute: {type: AttributeType.Numeric}, selection: "numeric", condition: "explicit"}, ({attribute}) => attribute.decision?.kind === DecisionKind.Explicit)
            .with({attribute: {type: AttributeType.Numeric}, selection: "numeric", condition: "none"}, ({attribute}) => attribute.decision != null)
            .with({attribute: {type: AttributeType.Numeric}, selection: "numeric", condition: "immutable"}, ({attribute}) => attribute.isPossibleDecisionStatesImmutable)

            // Undefined + immutable — only Boolean and Numeric. These two can end up
            // immutable with an empty possible-decision-state set and no decision
            // ("undefined immutable"), from which the UI can derive e.g. "true is
            // unavailable". Choice/Component cannot reach this state (the engine
            // guarantees at least one possible state), so they are intentionally
            // omitted.
            .with(
                {attribute: {type: AttributeType.Boolean}, selection: "undefined", condition: "immutable"},
                {attribute: {type: AttributeType.Numeric}, selection: "undefined", condition: "immutable"},
                ({attribute}) => attribute.decision == null && attribute.isPossibleDecisionStatesImmutable
            )

            // Undefined for all attributes
            .with({attribute: {type: AttributeType.Choice}, selection: "undefined"}, evaluateChoiceAttribute(v => v.decision == null))
            .with(
                {attribute: {type: AttributeType.Boolean}, selection: "undefined"},
                {attribute: {type: AttributeType.Component}, selection: "undefined"},
                {attribute: {type: AttributeType.Numeric}, selection: "undefined"}, ({attribute}) => attribute.decision == null
            )

            .otherwise(() => false));

    return variant && cloneChildrenWithProps(getContent(variant.content), {ref});
}))

export default SelectionIndicator;

const propertyControls: PropertyControls<Props> = {
    ...attributeIdPropertyControls,
    ...choiceValueIdPropertyControls,
    filterMode: {
        title: "Filter Mode",
        type: ControlType.Enum,
        defaultValue: "some",
        options: ["some", "every"],
        displaySegmentedControl: true,
        description: "Only applies for Choice Attributes without a specified Choice Value."
    },
    variants: {
        title: "Variants",
        type: ControlType.Array,
        maxCount: 10,
        control: {
            type: ControlType.Object,
            controls: {
                selection: {
                    title: "Selection",
                    type: ControlType.Enum,
                    defaultValue: "undefined",
                    options: ["undefined", "included", "excluded", "true", "false", "numeric"],
                },
                condition: {
                    title: "Condition",
                    type: ControlType.Enum,
                    defaultValue: "none",
                    options: ["none", "explicit", "implicit", "blocked", "available", "immutable"],
                },
                content: {
                    title: "Content",
                    type: ControlType.Enum,
                    defaultValue: 1,
                    options: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
                },
                useInDesignTime: {
                    title: "Design Time",
                    type: ControlType.Boolean,
                    defaultValue: false
                }
            }
        }
    },
    content1: {
        title: "Content 1",
        type: ControlType.ComponentInstance,
    },
    content2: {
        title: "Content 2",
        type: ControlType.ComponentInstance,
    },
    content3: {
        title: "Content 3",
        type: ControlType.ComponentInstance,
    },
    content4: {
        title: "Content 4",
        type: ControlType.ComponentInstance,
    },
    content5: {
        title: "Content 5",
        type: ControlType.ComponentInstance,
    },
    content6: {
        title: "Content 6",
        type: ControlType.ComponentInstance,
    },
    content7: {
        title: "Content 7",
        type: ControlType.ComponentInstance,
    },
    content8: {
        title: "Content 8",
        type: ControlType.ComponentInstance,
    },
    content9: {
        title: "Content 9",
        type: ControlType.ComponentInstance,
    },
    content10: {
        title: "Content 10",
        type: ControlType.ComponentInstance,
    }
}

addPropertyControls(SelectionIndicator, propertyControls);