import {addPropertyControls, ControlType, PropertyControls} from "framer"
import {useChoiceAttribute} from "@viamedici-spc/configurator-react"
import parseGlobalAttributeId from "../common/parseGlobalAttributeId";
import React, {Children, cloneElement, CSSProperties, PropsWithChildren, ReactNode} from "react";
import {attributeIdPropertyControls, AttributeIdProps} from "../props/attributeIdProps";
import withErrorBoundary from "../common/withErrorBoundary";
import withControlId, {useControlId} from "../common/controlId";
import styled, {createGlobalStyle} from "styled-components";
import Singleton from "./Singleton";
import {ChoiceValueDecisionState, ChoiceValueId, DecisionKind} from "@viamedici-spc/configurator-ts";
import useRenderPlaceholder from "../hooks/useRenderPlaceholder";
import useSortedChoiceValues from "../hooks/useSortedChoiceValues";
import {ChoiceValueNames, useChoiceValueNames} from "../hooks/localization";
import {match} from "ts-pattern";

type SelectionState = "undefined" | "included" | "excluded";
type Condition = "none" | "explicit" | "implicit" | "blocked";

type Filter = {
    selection: SelectionState,
    condition: Condition
}

type Props = AttributeIdProps & {
    itemTemplate: ReactNode,
    style: CSSProperties,
    filter: Filter[]
}

const Root = styled.div`
    display: contents;
`

const GlobalStyle = createGlobalStyle`
    :root {
        *:has(> ${Root}) {
            display: contents !important;
        }
    }
`

/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 */
const ChoiceValueListRenderer = withErrorBoundary(withControlId((props: Props) => {
    const controlId = useControlId();
    const renderPlaceholder = useRenderPlaceholder();

    const getItemTemplateDesignTime = () => Children.toArray(props.itemTemplate)[0];
    const getItemTemplateRuntimeTime = () => {
        const findItemTemplate = c => {
            const component = Children.toArray(c)[0] as any;
            const children = component.props?.children;
            if (children) {
                return findItemTemplate(children);
            }
            return component;
        }

        // The passed props.itemTemplate is wrapped by framer; sometimes multiple times.
        // Traverse the component tree until we find the component without any children. This is our real itemTemplate.
        return findItemTemplate(props.itemTemplate);
    };

    const itemTemplate = renderPlaceholder ? getItemTemplateDesignTime() : getItemTemplateRuntimeTime();
    if (!itemTemplate) {
        return <span>Choice Value Template not defined</span>
    }

    const renderChoiceValues = (choiceValues: ChoiceValueId[], choiceValueNames: ChoiceValueNames) => choiceValues.map(v => cloneElement(itemTemplate, {
            key: v,
            layoutId: `${controlId}_${v}`,
            attributeId: props.attributeId,
            componentPath: props.componentPath,
            sharedConfigurationModel: props.sharedConfigurationModel,
            choiceValueId: v,
            choiceValueName: choiceValueNames[v] ?? v
        }
    ));

    if (renderPlaceholder) {
        return (
            <Inner {...props}>
                {renderChoiceValues(["Choice Value 1", "Choice Value 2", "Choice Value 3"], {})}
            </Inner>
        )
    }

    const globalAttributeId = parseGlobalAttributeId(props);
    const choiceAttribute = useChoiceAttribute(globalAttributeId);
    if (!choiceAttribute) {
        return <span>Choice Attribute not found</span>
    }

    const choiceValueNames = useChoiceValueNames(globalAttributeId);
    const filter = props.filter ?? new Array<Filter>();
    const filteredChoiceValues = choiceAttribute.attribute.values.filter(v => filter.length === 0 || filter.some(({selection, condition}) => match({selection, condition})
        .with({selection: "included", condition: "blocked"}, () => !v.possibleDecisionStates.includes(ChoiceValueDecisionState.Included))
        .with({selection: "included", condition: "implicit"}, () => v.decision?.state === ChoiceValueDecisionState.Included && v.decision?.kind === DecisionKind.Implicit)
        .with({selection: "included", condition: "explicit"}, () => v.decision?.state === ChoiceValueDecisionState.Included && v.decision?.kind === DecisionKind.Explicit)
        .with({selection: "included", condition: "none"}, () => v.decision?.state === ChoiceValueDecisionState.Included)

        .with({selection: "excluded", condition: "blocked"}, () => !v.possibleDecisionStates.includes(ChoiceValueDecisionState.Excluded))
        .with({selection: "excluded", condition: "implicit"}, () => v.decision?.state === ChoiceValueDecisionState.Excluded && v.decision?.kind === DecisionKind.Implicit)
        .with({selection: "excluded", condition: "explicit"}, () => v.decision?.state === ChoiceValueDecisionState.Excluded && v.decision?.kind === DecisionKind.Explicit)
        .with({selection: "excluded", condition: "none"}, () => v.decision?.state === ChoiceValueDecisionState.Excluded)

        .with({selection: "undefined"}, () => v.decision == null)

        .otherwise(() => false))
    )

    const choiceValues = useSortedChoiceValues(globalAttributeId, choiceValueNames, filteredChoiceValues);
    const choiceValueIds = choiceValues.map(v => v.id);

    return (
        <Inner {...props}>
            {renderChoiceValues(choiceValueIds, choiceValueNames)}
        </Inner>
    )
}))

function Inner(props: PropsWithChildren<Props>) {
    return (
        <>
            <Singleton singletonId="ChoiceValueListRenderer">
                <GlobalStyle/>
            </Singleton>
            <Root style={props.style}>
                {props.children}
            </Root>
        </>
    )

}

export default ChoiceValueListRenderer;

const propertyControls: PropertyControls<Props> = {
    ...attributeIdPropertyControls,
    itemTemplate: {
        title: "Choice Value Template",
        type: ControlType.ComponentInstance
    },
    filter: {
        title: "Filter",
        type: ControlType.Array,
        control: {
            type: ControlType.Object,
            controls: {
                selection: {
                    title: "Selection",
                    type: ControlType.Enum,
                    defaultValue: "undefined",
                    options: ["undefined", "included", "excluded"],
                },
                condition: {
                    title: "Condition",
                    type: ControlType.Enum,
                    defaultValue: "none",
                    options: ["none", "explicit", "implicit", "blocked"],
                }
            }
        }
    }
}

addPropertyControls(ChoiceValueListRenderer, propertyControls);