import {addPropertyControls, ControlType, PropertyControls} from "framer"
import styled from "styled-components"
import {BooleanAttribute, ConfiguratorError, ConfiguratorErrorType, DecisionKind} from "@viamedici-spc/configurator-ts"
import {useBooleanAttribute} from "@viamedici-spc/configurator-react"
import useRenderPlaceholder from "../hooks/useRenderPlaceholder";
import {getSelectStyle, selectPropertyControls, SelectProps} from "../props/selectProps";
import parseGlobalAttributeId from "../common/parseGlobalAttributeId";
import {match} from "ts-pattern";
import useExplain from "../hooks/useExplain";
import {explainableComponent} from "../common/componentComposites";
import {useControlId} from "../common/controlId";
import {showMakeDecisionFailure} from "../common/failureAlerts";

const Root = styled.select`
    color: inherit;
    cursor: inherit;
`

const resetValue = "<reset>";
const nothingValue = "<nothing>";
const trueValue = "yes";
const falseValue = "no";

type Props = SelectProps & {
    trueLabel?: string,
    falseLabel?: string
}

/**
 * @framerIntrinsicWidth 300
 * @framerIntrinsicHeight 35
 *
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight fixed
 */
const BooleanSelect = explainableComponent<HTMLSelectElement, Props>((props, ref) => {
    const renderPlaceholder = useRenderPlaceholder();
    if (renderPlaceholder) {
        const style = getSelectStyle(props, true, false);
        return <Root style={style}/>
    }

    const controlId = useControlId();
    const globalAttributeId = parseGlobalAttributeId(props);
    const booleanAttribute = useBooleanAttribute(globalAttributeId);
    const {explain} = useExplain();

    if (!booleanAttribute) {
        return <span>Boolean Attribute not found</span>;
    }

    const {attribute, makeDecision} = booleanAttribute;

    const onChange = async (optionValue: string) => {
        const hasExplicitDecision = attribute.decision?.kind === DecisionKind.Explicit;
        if (optionValue === resetValue && hasExplicitDecision) {
            try {
                await makeDecision(undefined);
            } catch {
                showMakeDecisionFailure();
            }
        } else {
            const value = optionValue === trueValue;
            const isValuePossible = attribute.possibleDecisionStates.includes(value);
            const explainMode = props.explain;
            const maybeExplain = explainMode !== "disabled" && (() => explain(b => b.whyIsStateNotPossible.boolean(attribute.id).state(value), explainMode, controlId));

            if (isValuePossible) {
                try {
                    await makeDecision(value);
                } catch (e) {
                    const error = e as ConfiguratorError;
                    if (error.type === ConfiguratorErrorType.ConflictWithConsequence && maybeExplain) {
                        await maybeExplain();
                        return;
                    }
                    showMakeDecisionFailure();
                }
            } else if (maybeExplain) {
                await maybeExplain();
            }
        }
    };

    const selectedValue = match(attribute.decision?.state)
        .with(true, () => trueValue)
        .with(false, () => falseValue)
        .otherwise(() => nothingValue);

    const canReset = attribute.decision?.kind === DecisionKind.Explicit;
    const isImmutable = attribute.isPossibleDecisionStatesImmutable;
    const isImplicitSelected = attribute.decision?.kind === DecisionKind.Implicit && !isImmutable;
    const isFixedSelected = attribute.decision?.kind === DecisionKind.Implicit && isImmutable;
    const isTrueAllowed = attribute.possibleDecisionStates.includes(true);
    const isFalseAllowed = attribute.possibleDecisionStates.includes(false);
    const isTrueUnavailable = !isTrueAllowed && isImmutable;
    const isFalseUnavailable = !isFalseAllowed && isImmutable;
    const isTrueBlocked = !isTrueAllowed && !isImmutable;
    const isFalseBlocked = !isFalseAllowed && !isImmutable;
    // Both states blocked from inclusion (mutable + immutable bundled). Triggers
    // the `allOptionsBlockedColors` styling override. Explain may still help on
    // the mutably blocked subset, so the select stays enabled in this case.
    const allOptionsBlocked = !isTrueAllowed && !isFalseAllowed;
    // Stricter subset: both states are also immutable — nothing is Explainable.
    // Triggers the `noOptionsAvailableColors` styling override and, when the
    // designer opts in via `excludeUnavailable`, the whole-element `disabled`
    // attribute (browser default disabled styling takes over).
    const noOptionsAvailable = allOptionsBlocked && isImmutable;
    const isSelectDisabled = props.excludeUnavailableOptions && noOptionsAvailable;
    const style = getSelectStyle(props, attribute.isSatisfied, isImplicitSelected, isFixedSelected, allOptionsBlocked, noOptionsAvailable);

    const trueOption = (
        <option value={trueValue}>
            {decisionPrefix(attribute, true, isImmutable, props)}
            {props.trueLabel}
        </option>
    )

    const falseOption = (
        <option value={falseValue}>
            {decisionPrefix(attribute, false, isImmutable, props)}
            {props.falseLabel}
        </option>
    )

    const trueUnavailableOption = (
        <option value={trueValue} disabled>
            {props.trueLabel}
        </option>
    )

    const falseUnavailableOption = (
        <option value={falseValue} disabled>
            {props.falseLabel}
        </option>
    )

    const showBlockedGroup = isTrueBlocked || isFalseBlocked;
    const showUnavailableGroup = !props.excludeUnavailableOptions && (isTrueUnavailable || isFalseUnavailable);

    return (
        <Root ref={ref}
              value={selectedValue}
              onChange={e => onChange(e.currentTarget.value)}
              disabled={isSelectDisabled}
              style={style}>

            {selectedValue === nothingValue && (
                <option value={nothingValue}>
                </option>
            )}

            {canReset && (
                <option value={resetValue}>
                    {props.resetLabel}
                </option>
            )}

            {isTrueAllowed && trueOption}
            {isFalseAllowed && falseOption}

            {showBlockedGroup && (
                <optgroup label={props.blockedLabel}>
                    {isTrueBlocked && trueOption}
                    {isFalseBlocked && falseOption}
                </optgroup>
            )}

            {showUnavailableGroup && (
                <optgroup label={props.unavailableLabel}>
                    {isTrueUnavailable && trueUnavailableOption}
                    {isFalseUnavailable && falseUnavailableOption}
                </optgroup>
            )}
        </Root>
    )
})

export default BooleanSelect;

const decisionPrefix = (a: BooleanAttribute, value: boolean, isImmutable: boolean, props: Props): string => {
    if (a.decision?.kind !== DecisionKind.Implicit || a.decision?.state !== value) return "";
    return isImmutable ? props.fixedLabelPrefix : props.implicitLabelPrefix;
}

const propertyControls: PropertyControls<Props> = {
    ...selectPropertyControls,
    trueLabel: {
        title: "True Label",
        type: ControlType.String,
        defaultValue: "Yes",
    },
    falseLabel: {
        title: "False Label",
        type: ControlType.String,
        defaultValue: "No",
    }
}

addPropertyControls(BooleanSelect, propertyControls);
