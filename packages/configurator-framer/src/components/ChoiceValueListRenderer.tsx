import {addPropertyControls, ControlType, PropertyControls} from "framer"
import {useChoiceAttribute} from "@viamedici-spc/configurator-react"
import parseGlobalAttributeId from "../common/parseGlobalAttributeId";
import React, {Children, cloneElement, CSSProperties, PropsWithChildren, ReactNode} from "react";
import {attributeIdPropertyControls, AttributeIdProps} from "../props/attributeIdProps";
import withErrorBoundary from "../common/withErrorBoundary";
import withControlId, {useControlId} from "../common/controlId";
import styled, {createGlobalStyle} from "styled-components";
import Singleton from "./Singleton";
import {ChoiceValueId} from "@viamedici-spc/configurator-ts";
import useRenderPlaceholder from "../hooks/useRenderPlaceholder";
import useSortedChoiceValues from "../hooks/useSortedChoiceValues";

type Props = AttributeIdProps & {
    itemTemplate: ReactNode,
    style: CSSProperties
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

    const renderChoiceValues = (choiceValues: ChoiceValueId[]) => choiceValues.map(v => cloneElement(itemTemplate, {
            key: v,
            layoutId: `${controlId}_${v}`,
            attributeId: props.attributeId,
            componentPath: props.componentPath,
            sharedConfigurationModel: props.sharedConfigurationModel,
            choiceValueId: v
        }
    ));

    if (renderPlaceholder) {
        return (
            <Inner {...props}>
                {renderChoiceValues(["Choice Value 1", "Choice Value 2", "Choice Value 3"])}
            </Inner>
        )
    }

    const globalAttributeId = parseGlobalAttributeId(props);
    const choiceAttribute = useChoiceAttribute(globalAttributeId);
    const choiceValues = useSortedChoiceValues(globalAttributeId);

    if (!choiceAttribute) {
        return <span>Choice Attribute not found</span>
    }
    const choiceValueIds = choiceValues.map(v => v.id);

    return (
        <Inner {...props}>
            {renderChoiceValues(choiceValueIds)}
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
    }
}

addPropertyControls(ChoiceValueListRenderer, propertyControls);