import {addPropertyControls, ControlType, PropertyControls} from "framer"
import {AttributeType, ChoiceValue, ChoiceValueDecisionState, ComponentDecisionState, ConfiguratorError, ConfiguratorErrorType, DecisionKind, ExplainQuestionSubject, ExplainQuestionType, ExplicitDecision, WhyIsStateNotPossible} from "@viamedici-spc/configurator-ts"
import {useAttributes, useMakeDecision} from "@viamedici-spc/configurator-react"
import useRenderPlaceholder from "../hooks/useRenderPlaceholder";
import parseGlobalAttributeId from "../common/parseGlobalAttributeId";
import {PropsWithChildren} from "react";
import {attributeIdPropertyControls, AttributeIdProps} from "../props/attributeIdProps";
import {choiceValueIdPropertyControls, ChoiceValueIdProps} from "../props/choiceValueIdProps";
import {match} from "ts-pattern";
import cloneChildrenWithProps from "../common/cloneChildrenWithProps";
import useExplain from "../hooks/useExplain";
import {useControlId} from "../common/controlId";
import {explainableComponent} from "../common/componentComposites";
import {explainPropertyControls, ExplainProps} from "../props/explainProps";
import {showMakeDecisionFailure} from "../common/failureAlerts";

/*
    TODO
    - Warning if SelectionState is incompatible with attribute
 */

type SelectionState = "undefined" | "included" | "excluded" | "true" | "false";

type Props = AttributeIdProps & ChoiceValueIdProps & ExplainProps & {
    toggleFrom: SelectionState,
    toggleTo: SelectionState
}

/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 */
const SelectionToggle = explainableComponent<HTMLElement, PropsWithChildren<Props>>((props, ref) => {
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

    if (isNumericAttribute) {
        return <span>Numeric Attribute is not supported</span>;
    }

    let choiceValue: ChoiceValue = isChoiceAttribute ? attribute.values.get(choiceValueId) : null;
    if (hasChoiceValueId && choiceValue == null) {
        return <span>Choice Value not found</span>;
    }

    const isToggleStateActive = (state: SelectionState) => match({state, attribute})
        // Choice
        .with({attribute: {type: AttributeType.Choice}, state: "undefined"}, () => choiceValue.decision == null)
        .with({attribute: {type: AttributeType.Choice}, state: "included"}, () => choiceValue.decision?.state === ChoiceValueDecisionState.Included && choiceValue.decision?.kind === DecisionKind.Explicit)
        .with({attribute: {type: AttributeType.Choice}, state: "excluded"}, () => choiceValue.decision?.state === ChoiceValueDecisionState.Excluded && choiceValue.decision?.kind === DecisionKind.Explicit)

        // Boolean, Component
        .with({attribute: {type: AttributeType.Boolean}, state: "undefined"}, {attribute: {type: AttributeType.Component}, state: "undefined"}, ({attribute}) => attribute.decision == null)

        // Boolean
        .with({attribute: {type: AttributeType.Boolean}, state: "true"}, ({attribute}) => attribute.decision?.state === true && attribute.decision?.kind === DecisionKind.Explicit)
        .with({attribute: {type: AttributeType.Boolean}, state: "false"}, ({attribute}) => attribute.decision?.state === false && attribute.decision?.kind === DecisionKind.Explicit)

        // Component
        .with({attribute: {type: AttributeType.Component}, state: "included"}, ({attribute}) => attribute.decision?.state === ComponentDecisionState.Included && attribute.decision?.kind === DecisionKind.Explicit)
        .with({attribute: {type: AttributeType.Component}, state: "excluded"}, ({attribute}) => attribute.decision?.state === ComponentDecisionState.Excluded && attribute.decision?.kind === DecisionKind.Explicit)
        .otherwise(() => false)

    const mapToggleStateToDecision = (state: SelectionState) => match({isChoiceAttribute, isBooleanAttribute, isComponentAttribute, state})
        .with({isChoiceAttribute: true, state: "included"}, () => ChoiceValueDecisionState.Included)
        .with({isChoiceAttribute: true, state: "excluded"}, () => ChoiceValueDecisionState.Excluded)
        .with({isBooleanAttribute: true, state: "true"}, () => true)
        .with({isBooleanAttribute: true, state: "false"}, () => false)
        .with({isComponentAttribute: true, state: "included"}, () => ComponentDecisionState.Included)
        .with({isComponentAttribute: true, state: "excluded"}, () => ComponentDecisionState.Excluded)
        .otherwise(() => null)

    const isToggleFromActive = isToggleStateActive(props.toggleFrom);
    const isToggleToActive = isToggleStateActive(props.toggleTo);

    const onClick = async () => {
        const targetState = isToggleToActive ? props.toggleFrom : props.toggleTo;
        const targetDecision = mapToggleStateToDecision(targetState);

        const isComponentStatePossible = isComponentAttribute ? attribute.possibleDecisionStates.includes(targetDecision as ComponentDecisionState) : false;
        const isBooleanStatePossible = isBooleanAttribute ? attribute.possibleDecisionStates.includes(targetDecision as boolean) : false;
        const isChoiceValueStatePossible = isChoiceAttribute ? choiceValue.possibleDecisionStates.includes(targetDecision as ChoiceValueDecisionState) : false;
        const isAnyStatePossible = isChoiceValueStatePossible || isBooleanStatePossible || isComponentStatePossible;
        const explainMode = props.explain;
        const maybeExplain = explainMode !== "disabled" && (async () => {
            const subject = match({isComponentAttribute, isBooleanAttribute, isChoiceAttribute})
                .returnType<ExplainQuestionSubject | null>()
                .with({isChoiceAttribute: true}, () => ExplainQuestionSubject.choiceValue)
                .with({isBooleanAttribute: true}, () => ExplainQuestionSubject.boolean)
                .with({isComponentAttribute: true}, () => ExplainQuestionSubject.component)
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

        if (isAnyStatePossible || targetDecision == null) {
            try {
                await makeDecision({
                    type: attribute.type,
                    attributeId: globalAttributeId,
                    choiceValueId: choiceValueId,
                    state: targetDecision
                } as ExplicitDecision)
            } catch (e) {
                const error = e as ConfiguratorError;
                if (error.type === ConfiguratorErrorType.ConflictWithConsequence && maybeExplain) {
                    await maybeExplain();
                    return;
                }
                showMakeDecisionFailure();
            }
        } else if (maybeExplain) {
            await maybeExplain()
        }
    }

    return cloneChildrenWithProps(props.children, {onClick, ref});
})

export default SelectionToggle;

const propertyControls: PropertyControls<PropsWithChildren<Props>> = {
    ...attributeIdPropertyControls,
    ...choiceValueIdPropertyControls,
    children: {
        title: "Content",
        type: ControlType.ComponentInstance,
    },
    toggleFrom: {
        title: "Toggle From",
        type: ControlType.Enum,
        defaultValue: "undefined",
        options: ["undefined", "included", "excluded", "true", "false"],
    },
    toggleTo: {
        title: "Toggle To",
        type: ControlType.Enum,
        defaultValue: "included",
        options: ["undefined", "included", "excluded", "true", "false"],
    },
    ...explainPropertyControls
}

addPropertyControls(SelectionToggle, propertyControls);