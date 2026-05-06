import {addPropertyControls, ControlType, PropertyControls} from "framer"
import styled from "styled-components"
import {AttributeInterpreter, ComponentAttribute, ComponentDecisionState, ConfiguratorError, ConfiguratorErrorType, DecisionKind} from "@viamedici-spc/configurator-ts"
import {useComponentAttribute} from "@viamedici-spc/configurator-react"
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
const includedValue = "included";
const excludedValue = "excluded";

type Props = SelectProps & {
    includedLabel?: string,
    excludedLabel?: string
}

/**
 * @framerIntrinsicWidth 300
 * @framerIntrinsicHeight 35
 *
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight fixed
 */
const ComponentSelect = explainableComponent<HTMLSelectElement, Props>((props, ref) => {
    const renderPlaceholder = useRenderPlaceholder();
    if (renderPlaceholder) {
        const style = getSelectStyle(props, true, false);
        return <Root style={style}/>
    }

    const controlId = useControlId();
    const globalAttributeId = parseGlobalAttributeId(props);
    const componentAttribute = useComponentAttribute(globalAttributeId);
    const {explain} = useExplain();

    if (!componentAttribute) {
        return <span>Component Attribute not found</span>;
    }

    const {attribute, makeDecision} = componentAttribute;

    const makeDecisionWithExplain = async (state: ComponentDecisionState) => {
        const isStatePossible = attribute.possibleDecisionStates.includes(state);
        const explainMode = props.explain;
        const maybeExplain = explainMode !== "disabled" && (() => explain(b => b.whyIsStateNotPossible.component(attribute.id).state(state), explainMode, controlId));
        if (isStatePossible) {
            try {
                await makeDecision(state);
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
    };

    const onChange = async (optionValue: string) => {
        const hasExplicitDecision = attribute.decision?.kind === DecisionKind.Explicit ?? false;
        if (optionValue === resetValue && hasExplicitDecision) {
            await makeDecision(undefined);
        } else if (optionValue === includedValue) {
            await makeDecisionWithExplain(ComponentDecisionState.Included);
        } else if (optionValue === excludedValue) {
            await makeDecisionWithExplain(ComponentDecisionState.Excluded);
        }
    };

    const selectedValue = match(attribute.decision?.state)
        .with(ComponentDecisionState.Included, () => includedValue)
        .with(ComponentDecisionState.Excluded, () => excludedValue)
        .otherwise(() => nothingValue);

    const canReset = attribute.decision?.kind === DecisionKind.Explicit;
    const isImmutable = attribute.isPossibleDecisionStatesImmutable;
    const isImplicitSelected = attribute.decision?.kind === DecisionKind.Implicit && !isImmutable;
    const isFixedSelected = attribute.decision?.kind === DecisionKind.Implicit && isImmutable;
    const isIncludedAllowed = attribute.possibleDecisionStates.includes(ComponentDecisionState.Included);
    const isExcludedAllowed = attribute.possibleDecisionStates.includes(ComponentDecisionState.Excluded);
    const isIncludedUnavailable = !isIncludedAllowed && isImmutable;
    const isExcludedUnavailable = !isExcludedAllowed && isImmutable;
    const isIncludedBlocked = !isIncludedAllowed && !isImmutable;
    const isExcludedBlocked = !isExcludedAllowed && !isImmutable;
    // Both states blocked from inclusion (mutable + immutable bundled). Triggers
    // `allOptionsBlockedColors`. Engine guarantee: this is unreachable for a
    // Component attribute — at least one of Included/Excluded always remains
    // possible (this holds regardless of Trimming or Fixed Decisions). We still
    // compute the value to reuse the shared `getSelectStyle` abstraction
    // consistently across all Selects.
    const allOptionsBlocked = !isIncludedAllowed && !isExcludedAllowed;
    // Stricter subset: both states immutable-blocked. Triggers
    // `noOptionsAvailableColors`. Also unreachable for Component. No
    // whole-element disable is wired for the same reason.
    const noOptionsAvailable = allOptionsBlocked && isImmutable;
    const style = getSelectStyle(props, attribute.isSatisfied, isImplicitSelected, isFixedSelected, allOptionsBlocked, noOptionsAvailable);

    const includedOption = (
        <option value={includedValue}>
            {decisionPrefix(attribute, ComponentDecisionState.Included, isImmutable, props)}
            {props.includedLabel}
        </option>
    )

    const excludedOption = (
        <option value={excludedValue}>
            {decisionPrefix(attribute, ComponentDecisionState.Excluded, isImmutable, props)}
            {props.excludedLabel}
        </option>
    )

    const includedUnavailableOption = (
        <option value={includedValue} disabled>
            {props.includedLabel}
        </option>
    )

    const excludedUnavailableOption = (
        <option value={excludedValue} disabled>
            {props.excludedLabel}
        </option>
    )

    const showBlockedGroup = isIncludedBlocked || isExcludedBlocked;
    const showUnavailableGroup = !props.excludeUnavailableOptions && (isIncludedUnavailable || isExcludedUnavailable);

    return (
        <Root ref={ref}
              value={selectedValue}
              onChange={e => onChange(e.currentTarget.value)}
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

            {isIncludedAllowed && includedOption}
            {isExcludedAllowed && excludedOption}

            {showBlockedGroup && (
                <optgroup label={props.blockedLabel}>
                    {isIncludedBlocked && includedOption}
                    {isExcludedBlocked && excludedOption}
                </optgroup>
            )}

            {showUnavailableGroup && (
                <optgroup label={props.unavailableLabel}>
                    {isIncludedUnavailable && includedUnavailableOption}
                    {isExcludedUnavailable && excludedUnavailableOption}
                </optgroup>
            )}
        </Root>
    )
})

export default ComponentSelect;

const decisionPrefix = (a: ComponentAttribute, value: ComponentDecisionState, isImmutable: boolean, props: Props): string => {
    if (a.decision?.kind !== DecisionKind.Implicit || a.decision?.state !== value) return "";
    return isImmutable ? props.fixedLabelPrefix : props.implicitLabelPrefix;
}

const propertyControls: PropertyControls<Props> = {
    ...selectPropertyControls,
    includedLabel: {
        title: "Included Label",
        type: ControlType.String,
        defaultValue: "Included",
    },
    excludedLabel: {
        title: "Excluded Label",
        type: ControlType.String,
        defaultValue: "Excluded",
    }
}

addPropertyControls(ComponentSelect, propertyControls);
