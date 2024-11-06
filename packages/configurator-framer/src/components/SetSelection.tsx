import {addPropertyControls, ControlType, PropertyControls} from "framer"
import {
    AttributeType, ChoiceValue, ChoiceValueDecisionState, ComponentDecisionState, ConfiguratorError, ConfiguratorErrorType, ExplainQuestionSubject, ExplainQuestionType,
    ExplicitDecision, WhyIsStateNotPossible
} from "@viamedici-spc/configurator-ts"
import {useAttributes, useChoiceAttribute, useMakeDecision} from "@viamedici-spc/configurator-react"
import useRenderPlaceholder from "../hooks/useRenderPlaceholder";
import parseGlobalAttributeId from "../common/parseGlobalAttributeId";
import {PropsWithChildren} from "react";
import {attributeIdPropertyControls, AttributeIdProps} from "../props/attributeIdProps";
import {choiceValueIdPropertyControls, ChoiceValueIdProps} from "../props/choiceValueIdProps";
import {match} from "ts-pattern";
import cloneChildrenWithProps from "../common/cloneChildrenWithProps";
import useExplain from "../hooks/useExplain";
import {explainableComponent} from "../common/componentComposites";
import {useControlId} from "../common/controlId";
import {explainPropertyControls, ExplainProps} from "../props/explainProps";
import {showMakeDecisionFailure} from "../common/failureAlerts";

/*
    TODO
    - Warning if SelectionState is incompatible with attribute
 */

type SelectionState = "undefined" | "included" | "excluded" | "true" | "false" | "numeric";

type Props = AttributeIdProps & ChoiceValueIdProps & ExplainProps & {
    setSelection: SelectionState,
    numericValue: number,
    attributeIds: []
}

/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 */
const SetSelection = explainableComponent<HTMLElement, PropsWithChildren<Props>>((props, ref) => {
    const renderPlaceholder = useRenderPlaceholder();
    if (renderPlaceholder) {
        return props.children;
    }

    const controlId = useControlId();
    const {makeDecision} = useMakeDecision();
    const globalAttributeId = parseGlobalAttributeId(props);
    const choiceValueId = props.choiceValueId ?? "";
    const hasChoiceValueId = choiceValueId.length > 0;
    const attribute = useAttributes([globalAttributeId], false)[0];
    const choiceAttribute = useChoiceAttribute(globalAttributeId);
    const {explain} = useExplain();

    if (!attribute) {
        return <span>Attribute not found</span>;
    }

    const isChoiceAttribute = attribute.type === AttributeType.Choice;
    const isNumericAttribute = attribute.type === AttributeType.Numeric;
    const isBooleanAttribute = attribute.type === AttributeType.Boolean;
    const isComponentAttribute = attribute.type === AttributeType.Component;

    if (!isChoiceAttribute && hasChoiceValueId) {
        return <span>Attribute is not a Choice Attribute</span>;
    }

    let choiceValue: ChoiceValue = isChoiceAttribute ? attribute.values.get(choiceValueId) : null;
    if (hasChoiceValueId && choiceValue == null) {
        return <span>Choice Value not found</span>;
    }

    const mapSelectionStateToDecision = () =>
        match({isChoiceAttribute, isBooleanAttribute, isComponentAttribute, isNumericAttribute, hasChoiceValueId, state: props.setSelection})
            .with({isChoiceAttribute: true, hasChoiceValueId: true, state: "included"}, () => ChoiceValueDecisionState.Included)
            .with({isChoiceAttribute: true, hasChoiceValueId: true, state: "excluded"}, () => ChoiceValueDecisionState.Excluded)
            .with({isBooleanAttribute: true, state: "true"}, () => true)
            .with({isBooleanAttribute: true, state: "false"}, () => false)
            .with({isComponentAttribute: true, state: "included"}, () => ComponentDecisionState.Included)
            .with({isComponentAttribute: true, state: "excluded"}, () => ComponentDecisionState.Excluded)
            .with({isNumericAttribute: true, state: "numeric"}, () => props.numericValue)
            .otherwise(() => null)

    const onClick = async () => {
        if (isChoiceAttribute && !hasChoiceValueId && props.setSelection === "undefined") {
            try {
                await choiceAttribute.clearDecisions();
            } catch {
                showMakeDecisionFailure();
            }
        } else {
            const targetDecision = mapSelectionStateToDecision();
            const isComponentStatePossible = isComponentAttribute ? attribute.possibleDecisionStates.includes(targetDecision as ComponentDecisionState) : false;
            const isBooleanStatePossible = isBooleanAttribute ? attribute.possibleDecisionStates.includes(targetDecision as boolean) : false;
            const isChoiceValueStatePossible = isChoiceAttribute ? choiceValue.possibleDecisionStates.includes(targetDecision as ChoiceValueDecisionState) : false;
            const isAnyStatePossible = isChoiceValueStatePossible || isBooleanStatePossible || isComponentStatePossible;
            const explainMode = props.explain;
            const maybeExplain = explainMode !== "disabled" && (async () => {
                const subject = match({isComponentAttribute, isBooleanAttribute, isChoiceAttribute, isNumericAttribute})
                    .returnType<ExplainQuestionSubject | null>()
                    .with({isChoiceAttribute: true}, () => ExplainQuestionSubject.choiceValue)
                    .with({isBooleanAttribute: true}, () => ExplainQuestionSubject.boolean)
                    .with({isComponentAttribute: true}, () => ExplainQuestionSubject.component)
                    .with({isNumericAttribute: true}, () => ExplainQuestionSubject.numeric)
                    .otherwise(() => null);

                if (subject) {
                    await explain({
                        question: ExplainQuestionType.whyIsStateNotPossible,
                        subject: subject,
                        attributeId: globalAttributeId,
                        choiceValueId: choiceValueId,
                        state: targetDecision
                    } as WhyIsStateNotPossible, explainMode, controlId);
                }
            });

            if (isNumericAttribute || isAnyStatePossible || targetDecision == null) {
                try {
                    await makeDecision({
                        type: attribute.type,
                        attributeId: globalAttributeId,
                        choiceValueId: choiceValueId,
                        state: targetDecision
                    } as ExplicitDecision);
                } catch (e) {
                    const error = e as ConfiguratorError;
                    if ((error.type === ConfiguratorErrorType.ConflictWithConsequence || error.type === ConfiguratorErrorType.SetDecisionConflict) && maybeExplain) {
                        await maybeExplain();
                        return;
                    }
                    showMakeDecisionFailure();
                }
            } else if (maybeExplain) {
                await maybeExplain()
            }
        }
    }

    return cloneChildrenWithProps(props.children, {onClick, ref});
})

export default SetSelection;

const propertyControls: PropertyControls<PropsWithChildren<Props>> = {
    ...attributeIdPropertyControls,
    ...choiceValueIdPropertyControls,
    children: {
        title: "Content",
        type: ControlType.ComponentInstance,
    },
    setSelection: {
        title: "Set Selection To",
        type: ControlType.Enum,
        defaultValue: "undefined",
        options: ["undefined", "included", "excluded", "true", "false", "numeric"],
    },
    numericValue: {
        title: "Numeric Value",
        type: ControlType.Number,
        defaultValue: 0,
    },
    ...explainPropertyControls
}

addPropertyControls(SetSelection, propertyControls);