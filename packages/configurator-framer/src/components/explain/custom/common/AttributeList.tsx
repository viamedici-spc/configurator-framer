import {addPropertyControls, ControlType, PropertyControls} from "framer";
import React, {cloneElement, CSSProperties, ReactElement, ReactNode} from "react";
import withErrorBoundary from "../../../../common/withErrorBoundary";
import withControlId, {useControlId} from "../../../../common/controlId";
import useRenderPlaceholder from "../../../../hooks/useRenderPlaceholder";
import styled, {createGlobalStyle} from "styled-components";
import Singleton from "../../../Singleton";
import {mapAttributeId} from "../../../../common/RawDataParsing";
import {GlobalAttributeId} from "@viamedici-spc/configurator-ts";
import {pipe, RA} from "@viamedici-spc/fp-ts-extensions";
import {useAttributeName, useChoiceValueNames} from "../../../../hooks/localization";
import attributesContext, {AttributesContext} from "./attributesContext";
import {getItemTemplate} from "../../../../common/listRenderer";
import {ExplainAttribute, ExplainIntentionFilter, getExplainAttributes} from "../../common/explainAttributes";
import {useDecisionExplanationContext} from "./decisionExplanationContext";

type Props = {
    itemTemplate: ReactNode,
    style?: CSSProperties,
    intentionFilter: ExplainIntentionFilter
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
const AttributeList = withErrorBoundary(withControlId((props: Props) => {
    const controlId = useControlId();
    const renderPlaceholder = useRenderPlaceholder();

    const itemTemplate = getItemTemplate(props.itemTemplate);
    if (!itemTemplate) {
        return <span>Attribute Template not defined</span>;
    }

    if (renderPlaceholder) {
        const placeholderAttributes = createPlaceholderAttributes();
        return (
            <Inner style={props.style}>
                {placeholderAttributes.map(a => (
                    <AttributePlaceholder key={a.key} attribute={a} itemTemplate={itemTemplate} controlId={controlId}/>
                ))}
            </Inner>
        );
    }

    const explanation = useDecisionExplanationContext();
    if (!explanation) {
        return null;
    }
    const attributes = getExplainAttributes(explanation, props.intentionFilter);

    return (
        <Inner style={props.style}>
            {attributes.map(a => (
                <Attribute key={a.key} attribute={a} itemTemplate={itemTemplate} controlId={controlId}/>
            ))}
        </Inner>
    );
}));

export default AttributeList;

function Inner(props: { style?: CSSProperties, children: ReactNode }) {
    return (
        <>
            <Singleton singletonId="CustomExplainAttributeList">
                <GlobalStyle/>
            </Singleton>
            <Root style={props.style}>
                {props.children}
            </Root>
        </>
    );
}

function Attribute(props: { attribute: ExplainAttribute, itemTemplate: ReactElement, controlId: string }) {
    const {attribute, itemTemplate, controlId} = props;
    const attributeName = useAttributeName(attribute.attributeId) ?? attribute.attributeId.localId;
    const choiceValueNames = useChoiceValueNames(attribute.attributeId);
    const {attributeId, componentPath, sharedConfigurationModel} = mapAttributeId(attribute.attributeId);

    const contextValue: AttributesContext = {
        attributeId: attribute.attributeId,
        attributeName,
        decisions: attribute.decisions,
        choiceValueNames
    };

    return (
        <attributesContext.Provider value={contextValue}>
            {cloneElement(itemTemplate, {
                key: attribute.key,
                layoutId: `${controlId}_${attribute.key}`,
                attributeId: attributeId,
                componentPath: componentPath,
                sharedConfigurationModel: sharedConfigurationModel,
                attributeName
            })}
        </attributesContext.Provider>
    );
}

function AttributePlaceholder(props: { attribute: ExplainAttribute, itemTemplate: ReactElement, controlId: string }) {
    const {attribute, itemTemplate, controlId} = props;
    const {attributeId, componentPath, sharedConfigurationModel} = mapAttributeId(attribute.attributeId);
    const attributeName = attributeId;

    return cloneElement(itemTemplate, {
        key: attribute.key,
        layoutId: `${controlId}_${attribute.key}`,
        attributeId,
        componentPath,
        sharedConfigurationModel,
        attributeName
    });
}

function createPlaceholderAttributes(): ReadonlyArray<ExplainAttribute> {
    const makeAttributeId = (localId: string): GlobalAttributeId => ({
        localId,
        componentPath: [],
        sharedConfigurationModelId: null
    } as GlobalAttributeId);

    return pipe(
        ["Attribute A", "Attribute B", "Attribute C"],
        RA.map(id => {
            const attributeId = makeAttributeId(id);
            const decisions = [];
            return {key: id, attributeId, decisions};
        })
    )
}

const propertyControls: PropertyControls<Props> = {
    itemTemplate: {
        title: "Attribute Template",
        type: ControlType.ComponentInstance
    },
    intentionFilter: {
        title: "Intention Filter",
        type: ControlType.Enum,
        defaultValue: "any",
        options: ["any", "add", "remove"]
    }
};

addPropertyControls(AttributeList, propertyControls);
