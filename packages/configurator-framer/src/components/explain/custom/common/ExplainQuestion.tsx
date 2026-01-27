import {addPropertyControls, ControlType, PropertyControls} from "framer";
import React, {cloneElement, ReactElement, ReactNode} from "react";
import styled, {createGlobalStyle} from "styled-components";
import Singleton from "../../../Singleton";
import withErrorBoundary from "../../../../common/withErrorBoundary";
import withControlId, {useControlId} from "../../../../common/controlId";
import useRenderPlaceholder from "../../../../hooks/useRenderPlaceholder";
import useExplainProcess from "../../../../hooks/useExplainProcess";
import {getItemTemplate} from "../../../../common/listRenderer";
import {mapAttributeId} from "../../../../common/RawDataParsing";
import {ComponentDecisionState, ExplainQuestion, ExplainQuestionSubject, ExplainQuestionType} from "@viamedici-spc/configurator-ts";
import {match} from "ts-pattern";

type Props = {
    template: ReactNode,
    filter: ExplainQuestionFilter,
    useInDesignTime: boolean
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
const ExplainQuestion = withErrorBoundary(withControlId((props: Props) => {
    const controlId = useControlId();
    const renderPlaceholder = useRenderPlaceholder();

    const itemTemplate = getItemTemplate(props.template);
    if (!itemTemplate) {
        return <span>Template not defined.</span>;
    }

    if (renderPlaceholder) {
        return props.useInDesignTime && (
            <Inner>
                {renderPlaceholderItem(itemTemplate, controlId)}
            </Inner>
        );
    }

    const process = useExplainProcess();
    const explainQuestion = process?.explainQuestion ?? null;
    if (!explainQuestion) {
        return null;
    }

    if (!matchExplainQuestionFilter(explainQuestion, props.filter)) {
        return null;
    }

    const questionProps = buildQuestionProps(explainQuestion);
    const layoutId = controlId;

    return (
        <Inner>
            {cloneElement(itemTemplate, {
                key: layoutId,
                layoutId,
                ...questionProps
            })}
        </Inner>
    );
}));

export default ExplainQuestion;

function Inner(props: { children: ReactNode }) {
    return (
        <>
            <Singleton singletonId="CustomExplainQuestion">
                <GlobalStyle/>
            </Singleton>
            <Root>
                {props.children}
            </Root>
        </>
    );
}

function buildQuestionProps(question: ExplainQuestion) {
    const attributeId = "attributeId" in question ? question.attributeId : null;
    const choiceValueId = "choiceValueId" in question ? question.choiceValueId : null;
    const flattenedAttributeId = attributeId ? mapAttributeId(attributeId) : null;

    const value = match(question)
        .with({subject: ExplainQuestionSubject.component, state: ComponentDecisionState.Included}, () => "included")
        .with({subject: ExplainQuestionSubject.component, state: ComponentDecisionState.Excluded}, () => "excluded")
        .with({subject: ExplainQuestionSubject.boolean, state: true}, () => "true")
        .with({subject: ExplainQuestionSubject.boolean, state: false}, () => "false")
        .otherwise(() => "");

    const numericValue = match(question)
        .with({subject: ExplainQuestionSubject.numeric}, q => q.state)
        .otherwise(() => null);

    return {
        question: question.question,
        subject: question.subject,
        attributeId: flattenedAttributeId?.attributeId ?? "",
        componentPath: flattenedAttributeId?.componentPath ?? "",
        sharedConfigurationModel: flattenedAttributeId?.sharedConfigurationModel ?? "",
        choiceValueId: choiceValueId ?? "",
        value,
        numericValue
    };
}

function renderPlaceholderItem(itemTemplate: ReactElement, controlId: string) {
    const layoutId = `${controlId}_placeholder`;
    return cloneElement(itemTemplate, {
        key: layoutId,
        layoutId,
        question: "why-is-state-not-possible",
        subject: "choice-value",
        attributeId: "Color",
        componentPath: "",
        sharedConfigurationModel: "",
        choiceValueId: "Red",
        value: null,
        numericValue: null
    });
}

type ExplainQuestionFilter =
    | "any"
    | "configurationNotSatisfied"
    | "attributeNotSatisfied"
    | "choiceValueBlocked"
    | "componentValueBlocked"
    | "booleanValueBlocked"
    | "numericValueBlocked";

function matchExplainQuestionFilter(question: ExplainQuestion, filter: ExplainQuestionFilter): boolean {
    if (filter === "any") {
        return true;
    }

    return match(filter)
        .with("configurationNotSatisfied", () => match(question)
            .with({question: ExplainQuestionType.whyIsNotSatisfied, subject: ExplainQuestionSubject.configuration}, () => true)
            .otherwise(() => false)
        )
        .with("attributeNotSatisfied", () => match(question)
            .with({question: ExplainQuestionType.whyIsNotSatisfied, subject: ExplainQuestionSubject.attribute}, () => true)
            .otherwise(() => false)
        )
        .with("choiceValueBlocked", () => match(question)
            .with({question: ExplainQuestionType.whyIsStateNotPossible, subject: ExplainQuestionSubject.choiceValue}, () => true)
            .otherwise(() => false)
        )
        .with("componentValueBlocked", () => match(question)
            .with({question: ExplainQuestionType.whyIsStateNotPossible, subject: ExplainQuestionSubject.component}, () => true)
            .otherwise(() => false)
        )
        .with("booleanValueBlocked", () => match(question)
            .with({question: ExplainQuestionType.whyIsStateNotPossible, subject: ExplainQuestionSubject.boolean}, () => true)
            .otherwise(() => false)
        )
        .with("numericValueBlocked", () => match(question)
            .with({question: ExplainQuestionType.whyIsStateNotPossible, subject: ExplainQuestionSubject.numeric}, () => true)
            .otherwise(() => false)
        )
        .exhaustive();
}

const propertyControls: PropertyControls<Props> = {
    template: {
        title: "Template",
        type: ControlType.ComponentInstance
    },
    filter: {
        title: "Filter",
        type: ControlType.Enum,
        defaultValue: "any",
        options: [
            "any",
            "configurationNotSatisfied",
            "attributeNotSatisfied",
            "choiceValueBlocked",
            "componentValueBlocked",
            "booleanValueBlocked",
            "numericValueBlocked"
        ] satisfies ExplainQuestionFilter[]
    },
    useInDesignTime: {
        title: "Design Time",
        type: ControlType.Boolean,
        defaultValue: true
    }
};

addPropertyControls(ExplainQuestion, propertyControls);
