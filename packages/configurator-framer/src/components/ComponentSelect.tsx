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
    const isImplicitSelected = attribute.decision?.kind === DecisionKind.Implicit;
    const style = getSelectStyle(props, attribute.isSatisfied, isImplicitSelected);
    const isIncludedAllowed = attribute.possibleDecisionStates.includes(ComponentDecisionState.Included);
    const isExcludedAllowed = attribute.possibleDecisionStates.includes(ComponentDecisionState.Excluded);

    const includedOption = (
        <option value={includedValue}>
            {implicitLabelPrefix(attribute, ComponentDecisionState.Included, props.implicitLabelPrefix)}
            {props.includedLabel}
        </option>
    )

    const excludedOption = (
        <option value={excludedValue}>
            {implicitLabelPrefix(attribute, ComponentDecisionState.Excluded, props.implicitLabelPrefix)}
            {props.excludedLabel}
        </option>
    )

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

            {(!isIncludedAllowed || !isExcludedAllowed) && (
                <optgroup label={props.blockedLabel}>
                    {!isIncludedAllowed && includedOption}
                    {!isExcludedAllowed && excludedOption}
                </optgroup>
            )}
        </Root>
    )
})

export default ComponentSelect;

const implicitLabelPrefix = (a: ComponentAttribute, value: ComponentDecisionState, prefix: string) =>
    a.decision?.kind === DecisionKind.Implicit && a.decision?.state === value ? prefix : ""

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
