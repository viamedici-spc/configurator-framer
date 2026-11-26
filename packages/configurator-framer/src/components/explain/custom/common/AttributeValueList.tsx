import type {PropertyControls} from "framer";
import {addPropertyControls, ControlType} from "framer";
import type {CSSProperties, ReactElement, ReactNode} from "react";
import React, {cloneElement} from "react";
import styled, {createGlobalStyle} from "styled-components";
import Singleton from "../../../Singleton";
import withErrorBoundary from "../../../../common/withErrorBoundary";
import withControlId, {useControlId} from "../../../../common/controlId";
import useRenderPlaceholder from "../../../../hooks/useRenderPlaceholder";
import {getItemTemplate} from "../../../../common/listRenderer";
import {globalAttributeIdToString} from "../../../../common/GlobalAttributeIdExtensions";
import type {AttributesContext} from "./attributesContext";
import {useAttributesContext} from "./attributesContext";
import getDecisionStateDisplayName from "../../common/getDecisionStateDisplayName";
import useCommonExplainProps from "../../../../props/useCommonExplainProps";
import type {DecisionIntention} from "../../common/explainAttributes";
import sortDecisions from "../../common/sortDecisions";

type Props = {
    itemTemplate: ReactNode;
    style?: CSSProperties;
};

const Root = styled.div`
    display: contents;
`;

const GlobalStyle = createGlobalStyle`
    :root {
        *:has(> ${Root}) {
            display: contents !important;
        }
    }
`;

/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 */
const AttributeValueList = withErrorBoundary(
    withControlId((props: Props) => {
        const controlId = useControlId();
        const renderPlaceholder = useRenderPlaceholder();
        const context = useAttributesContext();

        const itemTemplate = getItemTemplate(props.itemTemplate);
        if (!itemTemplate) {
            return <span>Attribute Value Template not defined</span>;
        }

        if (renderPlaceholder) {
            return <Inner style={props.style}>{renderPlaceholderItems(itemTemplate, controlId)}</Inner>;
        }

        if (!context) {
            return null;
        }

        return (
            <Inner style={props.style}>
                <DecisionItems context={context} itemTemplate={itemTemplate} controlId={controlId} />
            </Inner>
        );
    }),
);

export default AttributeValueList;

function Inner(props: {style?: CSSProperties; children: ReactNode}) {
    return (
        <>
            <Singleton singletonId="CustomExplainAttributeValueList">
                <GlobalStyle />
            </Singleton>
            <Root style={props.style}>{props.children}</Root>
        </>
    );
}

// The explain props come from <Configuration />, which a template rendered on its own on the canvas lacks, so they are
// read only here, past the placeholder.
function DecisionItems(props: {context: AttributesContext; itemTemplate: ReactElement; controlId: string | null}) {
    const commonExplainProps = useCommonExplainProps();
    const {context, itemTemplate, controlId} = props;

    const attributeKey = globalAttributeIdToString(context.attributeId);
    const sortedDecisions = sortDecisions(context.decisions, context.choiceValueNames, commonExplainProps);
    return sortedDecisions.map((decision, index) => {
        const displayName = getDecisionStateDisplayName(decision, context.choiceValueNames, commonExplainProps);
        const layoutId = `${controlId}_${attributeKey}_${index}`;
        return cloneElement(itemTemplate, {
            key: layoutId,
            layoutId,
            displayName,
            intention: decision.intention,
        });
    });
}

function renderPlaceholderItems(itemTemplate: ReactElement, controlId: string | null): ReactNode {
    const items = [
        {displayName: "Value A", intention: "add" as DecisionIntention},
        {displayName: "Value B", intention: "remove" as DecisionIntention},
        {displayName: "Value C", intention: "remove" as DecisionIntention},
    ];

    return items.map((item, index) => {
        const layoutId = `${controlId}_placeholder_${index}`;
        return cloneElement(itemTemplate, {
            key: layoutId,
            layoutId,
            displayName: item.displayName,
            intention: item.intention,
        });
    });
}

const propertyControls: PropertyControls<Props> = {
    itemTemplate: {
        title: "Attribute Value Template",
        type: ControlType.ComponentInstance,
    },
};

addPropertyControls(AttributeValueList, propertyControls);