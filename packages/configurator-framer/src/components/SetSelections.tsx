import {addPropertyControls, ControlType, PropertyControls} from "framer"
import {
    AttributeType,
    AutomaticConflictResolution,
    ChoiceValue,
    ChoiceValueDecisionState,
    ComponentDecisionState,
    DecisionKind, DecisionsExplainAnswer,
    ExplicitDecision,
    FailureResult,
    FailureType,
    ManualConflictResolution,
    SetManyDropExistingDecisionsMode,
    SetManyKeepExistingDecisionsMode,
    SetManyMode
} from "@viamedici-spc/configurator-ts"
import {useAttributes, useDecision} from "@viamedici-spc/configurator-react"
import useRenderPlaceholder from "../hooks/useRenderPlaceholder";
import parseGlobalAttributeId from "../common/parseGlobalAttributeId";
import {PropsWithChildren, ReactNode, useEffect} from "react";
import {attributeIdPropertyControls, AttributeIdProps} from "../props/attributeIdProps";
import {match} from "ts-pattern";
import {choiceValueIdPropertyControls, ChoiceValueIdProps} from "../props/choiceValueIdProps";
import cloneChildrenWithProps from "../common/cloneChildrenWithProps";
import useExplain from "../hooks/useExplain";
import {showMakeDecisionFailure} from "../common/failureAlerts";
import {explainPropertyControls, ExplainProps} from "../props/explainProps";
import {useControlId} from "../common/controlId";
import {explainableComponent} from "../common/componentComposites";

/*
    TODO
    - Warning if SelectionState is incompatible with attribute
 */

type SelectionState = "undefined" | "included" | "excluded" | "true" | "false" | "numeric";

type Props = ExplainProps & {
    attributes: (AttributeIdProps & ChoiceValueIdProps & {
        setSelection: SelectionState,
        numericValue: number,
    })[],
    existingSelections: "keep" | "drop",
    autoResolveConflicts: boolean,
    trigger: "click" | "auto"
}

/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 */
const SetSelections = explainableComponent<HTMLElement, PropsWithChildren<Props>>((props, ref) => {
    const renderPlaceholder = useRenderPlaceholder();
    if (renderPlaceholder) {
        return props.children;
    }

    const controlId = useControlId();
    const {setManyDecision} = useDecision();
    const {handleExplainAnswer} = useExplain();
    const globalAttributeIds = props.attributes.map(parseGlobalAttributeId);
    const attributes: { getDecisions?: () => ExplicitDecision[], error?: ReactNode }[] = useAttributes(globalAttributeIds).map((attribute, i) => {
        if (!attribute) {
            return {
                error: <span>Attribute not found</span>
            };
        }

        const attributeProps = props.attributes[i];
        const choiceValueId = attributeProps.choiceValueId ?? "";
        const hasChoiceValueId = choiceValueId.length > 0;
        const isChoiceAttribute = attribute.type === AttributeType.Choice;
        const isNumericAttribute = attribute.type === AttributeType.Numeric;
        const isBooleanAttribute = attribute.type === AttributeType.Boolean;
        const isComponentAttribute = attribute.type === AttributeType.Component;

        if (!isChoiceAttribute && hasChoiceValueId) {
            return {
                error: <span>Attribute is not a Choice Attribute</span>
            };
        }

        let choiceValue: ChoiceValue = isChoiceAttribute ? attribute.values.find((v) => v.id === choiceValueId) : null;
        if (hasChoiceValueId && choiceValue == null) {
            return {
                error: <span>Choice Value not found</span>
            };
        }

        const mapSelectionStateToDecision = () =>
            match({isChoiceAttribute, isBooleanAttribute, isComponentAttribute, isNumericAttribute, hasChoiceValueId, state: attributeProps.setSelection})
                .with({isChoiceAttribute: true, hasChoiceValueId: true, state: "included"}, () => ChoiceValueDecisionState.Included)
                .with({isChoiceAttribute: true, hasChoiceValueId: true, state: "excluded"}, () => ChoiceValueDecisionState.Excluded)
                .with({isBooleanAttribute: true, state: "true"}, () => true)
                .with({isBooleanAttribute: true, state: "false"}, () => false)
                .with({isComponentAttribute: true, state: "included"}, () => ComponentDecisionState.Included)
                .with({isComponentAttribute: true, state: "excluded"}, () => ComponentDecisionState.Excluded)
                .with({isNumericAttribute: true, state: "numeric"}, () => attributeProps.numericValue)
                .otherwise(() => null)

        return {
            getDecisions: () => {
                if (isChoiceAttribute && !hasChoiceValueId && attributeProps.setSelection === "undefined") {
                    return attribute.values
                        .filter(v => v.decision?.kind === DecisionKind.Explicit)
                        .map(v => ({
                            type: attribute.type,
                            attributeId: attribute.id,
                            choiceValueId: v.id,
                            state: null
                        } as ExplicitDecision));
                } else {
                    return [{
                        type: attribute.type,
                        attributeId: attribute.id,
                        choiceValueId: choiceValueId,
                        state: mapSelectionStateToDecision()
                    } as ExplicitDecision]
                }
            }
        }
    });

    const error = attributes.find(a => a.error)?.error;
    if (error) {
        return error;
    }


    const trigger = async () => {
        const decisions = attributes.reduce((xs, x) => [...xs, ...x.getDecisions()], new Array<ExplicitDecision>());
        const mode: SetManyMode = match(props.existingSelections)
            .with("keep", () => ({type: "KeepExistingDecisions"}) satisfies SetManyKeepExistingDecisionsMode)
            .with("drop", () => ({
                type: "DropExistingDecisions",
                conflictHandling: match(props.autoResolveConflicts)
                    .with(false, () => ({
                        type: "Manual",
                        includeConstraintsInConflictExplanation: false
                    }) satisfies ManualConflictResolution)
                    .with(true, () => ({
                        type: "Automatic"
                    }) satisfies AutomaticConflictResolution)
                    .exhaustive()
            }) satisfies SetManyDropExistingDecisionsMode)
            .exhaustive()

        try {
            await setManyDecision(decisions, mode);
        } catch (e) {
            const failureResult = e as FailureResult;
            console.debug("SetMany failed", failureResult)

            const hasConflict = failureResult?.type === FailureType.ConfigurationSetManyConflict && failureResult.decisionExplanations;
            if (hasConflict) {
                if (props.explain !== "disabled") {
                    await handleExplainAnswer(failureResult satisfies DecisionsExplainAnswer, props.explain, controlId);
                }
                return;
            }

            // TODO: This can only be displayed with configurator-ts v2 and a more precise setMany()
            // const rejected = failureResult?.type === FailureType.ConfigurationRejectedDecisionsConflict;
            // if (rejected) {
            //     alert("Some selections could not be applied because of a conflict")
            //     return;
            // }

            showMakeDecisionFailure();
            return;
        }
    }

    const onClick = () => {
        if (props.trigger !== "click") {
            return;
        }
        trigger();
    }

    useEffect(() => {
        if (props.trigger !== "auto") {
            return;
        }
        trigger();
    }, []);

    return cloneChildrenWithProps(props.children, {onClick, ref});
})

export default SetSelections;

const propertyControls: PropertyControls<PropsWithChildren<Props>> = {
    children: {
        title: "Content",
        type: ControlType.ComponentInstance,
    },
    attributes: {
        title: "Attributes",
        type: ControlType.Array,
        control: {
            type: ControlType.Object,
            controls: {
                ...attributeIdPropertyControls,
                ...choiceValueIdPropertyControls,
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
                }
            }
        }
    },
    existingSelections: {
        title: "Existing Selections",
        type: ControlType.Enum,
        defaultValue: "keep",
        options: ["keep", "drop"],
    },
    autoResolveConflicts: {
        title: "Auto Resolve Conflicts",
        type: ControlType.Boolean,
        defaultValue: true,
        hidden: (props: Props) => props.existingSelections !== "drop"
    },
    trigger: {
        title: "Trigger",
        type: ControlType.Enum,
        defaultValue: "click",
        options: ["click", "auto"],
        displaySegmentedControl: true,
        segmentedControlDirection: "horizontal"
    },
    ...explainPropertyControls
}

addPropertyControls(SetSelections, propertyControls);