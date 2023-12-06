import {addPropertyControls, ControlType, PropertyControls} from "framer"
import {useAttributes} from "@viamedici-spc/configurator-react"
import useRenderPlaceholder from "../hooks/useRenderPlaceholder";
import parseGlobalAttributeId from "../common/parseGlobalAttributeId";
import {forwardRef, ReactNode} from "react";
import {attributeIdPropertyControls, AttributeIdProps} from "../props/attributeIdProps";
import {choiceValueIdPropertyControls, ChoiceValueIdProps} from "../props/choiceValueIdProps";
import {match} from "ts-pattern";
import {AttributeType, ChoiceValue, ChoiceValueDecisionState, ComponentDecisionState, DecisionKind} from "@viamedici-spc/configurator-ts";
import withErrorBoundary from "../common/withErrorBoundary";
import cloneChildrenWithProps from "../common/cloneChildrenWithProps";

type SelectionState = "undefined" | "included" | "excluded" | "true" | "false" | "numeric";
type Condition = "none" | "explicit" | "implicit" | "blocked";

type Variant = {
    selection: SelectionState,
    condition: Condition,
    content: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10,
    useInDesignTime: boolean
}

type Props = AttributeIdProps & ChoiceValueIdProps & {
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
    const attribute = useAttributes([globalAttributeId])[0];

    if (!attribute) {
        return <span>Attribute not found</span>;
    }

    const isChoiceAttribute = attribute.type === AttributeType.Choice;

    if (!isChoiceAttribute && hasChoiceValueId) {
        return <span>Attribute is not a Choice Attribute</span>;
    }

    if (isChoiceAttribute && !hasChoiceValueId) {
        return <span>Choice Value Id missing</span>;
    }

    let choiceValue: ChoiceValue = isChoiceAttribute ? attribute.values.find((v) => v.id === choiceValueId) : null;
    if (hasChoiceValueId && choiceValue == null) {
        return <span>Choice Value not found</span>;
    }

    const variant = [...props.variants]
        .find(({selection, condition}) => {
            return match({selection, condition, attribute})
                // Choice
                .with({attribute: {type: AttributeType.Choice}, selection: "included", condition: "blocked"}, () => !choiceValue.possibleDecisionStates.includes(ChoiceValueDecisionState.Included))
                .with({attribute: {type: AttributeType.Choice}, selection: "included", condition: "implicit"}, () => choiceValue.decision?.state === ChoiceValueDecisionState.Included && choiceValue.decision?.kind === DecisionKind.Implicit)
                .with({attribute: {type: AttributeType.Choice}, selection: "included", condition: "explicit"}, () => choiceValue.decision?.state === ChoiceValueDecisionState.Included && choiceValue.decision?.kind === DecisionKind.Explicit)
                .with({attribute: {type: AttributeType.Choice}, selection: "included", condition: "none"}, () => choiceValue.decision?.state === ChoiceValueDecisionState.Included)

                .with({attribute: {type: AttributeType.Choice}, selection: "excluded", condition: "blocked"}, () => !choiceValue.possibleDecisionStates.includes(ChoiceValueDecisionState.Excluded))
                .with({attribute: {type: AttributeType.Choice}, selection: "excluded", condition: "implicit"}, () => choiceValue.decision?.state === ChoiceValueDecisionState.Excluded && choiceValue.decision?.kind === DecisionKind.Implicit)
                .with({attribute: {type: AttributeType.Choice}, selection: "excluded", condition: "explicit"}, () => choiceValue.decision?.state === ChoiceValueDecisionState.Excluded && choiceValue.decision?.kind === DecisionKind.Explicit)
                .with({attribute: {type: AttributeType.Choice}, selection: "excluded", condition: "none"}, () => choiceValue.decision?.state === ChoiceValueDecisionState.Excluded)

                // Boolean
                .with({attribute: {type: AttributeType.Boolean}, selection: "true", condition: "blocked"}, ({attribute}) => !attribute.possibleDecisionStates.includes(true))
                .with({attribute: {type: AttributeType.Boolean}, selection: "true", condition: "implicit"}, ({attribute}) => attribute.decision?.state === true && attribute.decision?.kind === DecisionKind.Implicit)
                .with({attribute: {type: AttributeType.Boolean}, selection: "true", condition: "explicit"}, ({attribute}) => attribute.decision?.state === true && attribute.decision?.kind === DecisionKind.Explicit)
                .with({attribute: {type: AttributeType.Boolean}, selection: "true", condition: "none"}, ({attribute}) => attribute.decision?.state === true)

                .with({attribute: {type: AttributeType.Boolean}, selection: "false", condition: "blocked"}, ({attribute}) => !attribute.possibleDecisionStates.includes(false))
                .with({attribute: {type: AttributeType.Boolean}, selection: "false", condition: "implicit"}, ({attribute}) => attribute.decision?.state === false && attribute.decision?.kind === DecisionKind.Implicit)
                .with({attribute: {type: AttributeType.Boolean}, selection: "false", condition: "explicit"}, ({attribute}) => attribute.decision?.state === false && attribute.decision?.kind === DecisionKind.Explicit)
                .with({attribute: {type: AttributeType.Boolean}, selection: "false", condition: "none"}, ({attribute}) => attribute.decision?.state === false)

                // Component
                .with({attribute: {type: AttributeType.Component}, selection: "included", condition: "blocked"}, ({attribute}) => !attribute.possibleDecisionStates.includes(ComponentDecisionState.Included))
                .with({attribute: {type: AttributeType.Component}, selection: "included", condition: "implicit"}, ({attribute}) => attribute.decision?.state === ComponentDecisionState.Included && attribute.decision?.kind === DecisionKind.Implicit)
                .with({attribute: {type: AttributeType.Component}, selection: "included", condition: "explicit"}, ({attribute}) => attribute.decision?.state === ComponentDecisionState.Included && attribute.decision?.kind === DecisionKind.Explicit)
                .with({attribute: {type: AttributeType.Component}, selection: "included", condition: "none"}, ({attribute}) => attribute.decision?.state === ComponentDecisionState.Included)

                .with({attribute: {type: AttributeType.Component}, selection: "excluded", condition: "blocked"}, ({attribute}) => !attribute.possibleDecisionStates.includes(ComponentDecisionState.Excluded))
                .with({attribute: {type: AttributeType.Component}, selection: "excluded", condition: "implicit"}, ({attribute}) => attribute.decision?.state === ComponentDecisionState.Excluded && attribute.decision?.kind === DecisionKind.Implicit)
                .with({attribute: {type: AttributeType.Component}, selection: "excluded", condition: "explicit"}, ({attribute}) => attribute.decision?.state === ComponentDecisionState.Excluded && attribute.decision?.kind === DecisionKind.Explicit)
                .with({attribute: {type: AttributeType.Component}, selection: "excluded", condition: "none"}, ({attribute}) => attribute.decision?.state === ComponentDecisionState.Excluded)

                // Numeric
                .with({attribute: {type: AttributeType.Numeric}, selection: "numeric", condition: "implicit"}, ({attribute}) => attribute.decision?.kind === DecisionKind.Implicit)
                .with({attribute: {type: AttributeType.Numeric}, selection: "numeric", condition: "explicit"}, ({attribute}) => attribute.decision?.kind === DecisionKind.Explicit)
                .with({attribute: {type: AttributeType.Numeric}, selection: "numeric", condition: "none"}, ({attribute}) => attribute.decision != null)

                // Undefined for all attributes
                .with({attribute: {type: AttributeType.Choice}, selection: "undefined"}, () => choiceValue.decision == null)
                .with(
                    {attribute: {type: AttributeType.Boolean}, selection: "undefined"},
                    {attribute: {type: AttributeType.Component}, selection: "undefined"},
                    {attribute: {type: AttributeType.Numeric}, selection: "undefined"}, ({attribute}) => attribute.decision == null
                )

                .otherwise(() => false)
        });

    return variant && cloneChildrenWithProps(getContent(variant.content), {ref});
}))

export default SelectionIndicator;

const propertyControls: PropertyControls<Props> = {
    ...attributeIdPropertyControls,
    ...choiceValueIdPropertyControls,
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
                    options: ["none", "explicit", "implicit", "blocked"],
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