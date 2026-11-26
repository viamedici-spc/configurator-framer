import type { PropertyControls} from "framer";
import {addPropertyControls, ControlType} from "framer"
import styled from "styled-components"
import type {ConfiguratorError, NumericAttribute} from "@viamedici-spc/configurator-ts";
import { ConfiguratorErrorType, DecisionKind} from "@viamedici-spc/configurator-ts"
import {useNumericAttribute} from "@viamedici-spc/configurator-react"
import useRenderPlaceholder from "../hooks/useRenderPlaceholder";
import type { InputProps} from "../props/inputProps";
import {getInputStyle, inputPropertyControls} from "../props/inputProps";
import parseGlobalAttributeId from "../common/parseGlobalAttributeId";
import type {NumberFormatValues} from "react-number-format";
import NumericFormat from "react-number-format";
import useDebounceValue from "../hooks/useDebounceValue";
import {useState} from "react";
import useExplain from "../hooks/useExplain";
import {explainableComponent} from "../common/componentComposites";
import {useControlId} from "../common/controlId";
import type NumberFormat from "react-number-format";
import {showMakeDecisionFailure} from "../common/failureAlerts";

const Root = styled(NumericFormat)`
    color: inherit;
`

type Props = InputProps & {
    wait: number,
    decimalSeparator: string,
    thousandSeparator: string,
    placeholder: string
}

/**
 * @framerIntrinsicWidth 300
 * @framerIntrinsicHeight 35
 *
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight fixed
 */
const NumericInput = explainableComponent<NumberFormat<unknown>, Props>((props, ref) => {
    const renderPlaceholder = useRenderPlaceholder();
    if (renderPlaceholder) {
        const style = getInputStyle(props, true, false);
        return <Root style={style}/>
    }

    const controlId = useControlId();
    const globalAttributeId = parseGlobalAttributeId(props);
    const numericAttribute = useNumericAttribute(globalAttributeId);
    const {explain} = useExplain();

    if (!numericAttribute) {
        return <span>Numeric Attribute not found</span>;
    }

    const {attribute, makeDecision} = numericAttribute;

    const isImmutable = attribute.isPossibleDecisionStatesImmutable;
    const isImplicitSelected = attribute.decision?.kind === DecisionKind.Implicit && !isImmutable;
    const isFixedSelected = attribute.decision?.kind === DecisionKind.Implicit && isImmutable;
    const style = getInputStyle(props, attribute.isSatisfied, isImplicitSelected, isFixedSelected);
    const value = attribute.decision?.state;
    const [valueInput, setValueInput] = useState(value);
    const {min, max} = attribute.range;

    // An empty input passes undefined, which removes the decision.
    const setSourceValue = async (value: number | undefined) => {
        if (value != null && value < min) {
            alert(`The value must be greater than or equal to ${min}.`)
            return;
        }
        if (value != null && value > max) {
            alert(`The value must be smaller than or equal to ${max}.`)
            return;
        }

        try {
            await makeDecision(value);
        } catch (e) {
            const error = e as ConfiguratorError;
            const isValueNotPossible = error.type === ConfiguratorErrorType.SetDecisionConflict;
            if (!isValueNotPossible) {
                showMakeDecisionFailure();
            } else if (props.explain !== "disabled" && value != null) {
                // Removing a decision (value undefined) cannot conflict, so there is nothing to explain then.
                await explain(b => b.whyIsStateNotPossible.numeric(attribute.id).state(value), props.explain, controlId);
            }
        }
    };
    const debouncedValue = useDebounceValue(value, setSourceValue, valueInput, v => setValueInput(v), props.wait);

    return (
        <Root getInputRef={ref}
              thousandsGroupStyle="thousand"
              decimalSeparator={props.decimalSeparator}
              thousandSeparator={props.thousandSeparator}
              allowNegative={true}
              fixedDecimalScale={true}
              decimalScale={attribute.decimalPlaces}
              allowEmptyFormatting={false}
              displayType="input"
              placeholder={props.placeholder}
              prefix={decisionPrefix(attribute, isImmutable, props)}
              readOnly={isImmutable}
              onBlur={() => {
                  debouncedValue.flush();
              }}
              onKeyPress={e => {
                  if (e.key === "Enter") {
                      debouncedValue.flush();
                  }
              }}
              onValueChange={(v: NumberFormatValues) => setValueInput(v.floatValue)}
              value={valueInput ?? ""}
              style={style}/>
    )
})

export default NumericInput;

const decisionPrefix = (a: NumericAttribute, isImmutable: boolean, props: Props): string => {
    if (a.decision?.kind !== DecisionKind.Implicit) return "";
    return isImmutable ? props.fixedLabelPrefix : props.implicitLabelPrefix;
}

const propertyControls: PropertyControls<Props> = {
    ...inputPropertyControls,
    wait: {
        title: "Debounce Delay",
        type: ControlType.Number,
        defaultValue: 2000,
        min: 0,
        unit: "ms"
    },
    decimalSeparator: {
        title: "Decimal Separator",
        type: ControlType.String,
        defaultValue: ",",
        maxLength: 1
    },
    thousandSeparator: {
        title: "Thousand Separator",
        type: ControlType.String,
        defaultValue: ".",
        maxLength: 1
    },
    placeholder: {
        title: "Placeholder",
        type: ControlType.String,
        defaultValue: "",
    }
}

addPropertyControls(NumericInput, propertyControls);
