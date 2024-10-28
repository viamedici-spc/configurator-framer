import {addPropertyControls, ControlType, PropertyControls} from "framer"
import styled from "styled-components"
import {AttributeInterpreter, BooleanAttribute, DecisionKind} from "@viamedici-spc/configurator-ts"
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
        const hasExplicitDecision = AttributeInterpreter.getBooleanDecision(attribute) != null;
        if (optionValue === resetValue && hasExplicitDecision) {
            try {
                await makeDecision(undefined);
            } catch {
                showMakeDecisionFailure();
            }
        } else {
            const value = optionValue === trueValue;
            const isValuePossible = AttributeInterpreter.isBooleanValuePossible(attribute, value);
            if (isValuePossible) {
                try {
                    await makeDecision(value);
                } catch {
                    showMakeDecisionFailure();
                }
            } else if (props.explain !== "disabled") {
                await explain(b => b.whyIsStateNotPossible.boolean(attribute.id).state(value), props.explain, controlId);
            }
        }
    };

    const selectedValue = match(attribute.decision?.state)
        .with(true, () => trueValue)
        .with(false, () => falseValue)
        .otherwise(() => nothingValue);

    const canReset = attribute.decision?.kind === DecisionKind.Explicit;
    const isImplicitSelected = attribute.decision?.kind === DecisionKind.Implicit;
    const style = getSelectStyle(props, attribute.isSatisfied, isImplicitSelected);
    const isTrueAllowed = AttributeInterpreter.isBooleanValuePossible(attribute, true);
    const isFalseAllowed = AttributeInterpreter.isBooleanValuePossible(attribute, false);

    const trueOption = (
        <option value={trueValue}>
            {implicitLabelPrefix(attribute, true, props.implicitLabelPrefix)}
            {props.trueLabel}
        </option>
    )

    const falseOption = (
        <option value={falseValue}>
            {implicitLabelPrefix(attribute, false, props.implicitLabelPrefix)}
            {props.falseLabel}
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

            {isTrueAllowed && trueOption}
            {isFalseAllowed && falseOption}

            {(!isTrueAllowed || !isFalseAllowed) && (
                <optgroup label={props.blockedLabel}>
                    {!isTrueAllowed && trueOption}
                    {!isFalseAllowed && falseOption}
                </optgroup>
            )}
        </Root>
    )
})

export default BooleanSelect;

const implicitLabelPrefix = (a: BooleanAttribute, value: boolean, prefix: string) =>
    a.decision?.kind === DecisionKind.Implicit && a.decision?.state === value ? prefix : ""

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
