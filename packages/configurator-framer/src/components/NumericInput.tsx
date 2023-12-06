import {addPropertyControls, ControlType, PropertyControls} from "framer"
import styled from "styled-components"
import {DecisionKind, FailureResult, FailureType, NumericAttribute} from "@viamedici-spc/configurator-ts"
import {useNumericAttribute} from "@viamedici-spc/configurator-react"
import useRenderPlaceholder from "../hooks/useRenderPlaceholder";
import {getInputStyle, inputPropertyControls, InputProps} from "../props/inputProps";
import parseGlobalAttributeId from "../common/parseGlobalAttributeId";
import NumericFormat, {NumberFormatValues} from "react-number-format";
import useDebounceValue from "../hooks/useDebounceValue";
import {useState} from "react";
import useExplain from "../hooks/useExplain";
import {explainableComponent} from "../common/componentComposites";
import {useControlId} from "../common/controlId";
import NumberFormat from "react-number-format";
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

    const isImplicitSelected = attribute.decision?.kind === DecisionKind.Implicit;
    const style = getInputStyle(props, attribute.isSatisfied, isImplicitSelected);

    const value = attribute.decision?.state;
    const [valueInput, setValueInput] = useState(value);
    const {min, max} = attribute.range;

    const setSourceValue = async (value: number) => {
        if (value < min) {
            alert(`The value must be smaller than or equal to ${min}.`)
            return;
        }
        if (value > max) {
            alert(`The value must be greater than or equal to ${max}.`)
            return;
        }

        try {
            await makeDecision(value);
        } catch (e) {
            const failureResult = e as FailureResult;
            const isValueNotPossible = failureResult.type === FailureType.ConfigurationModelNotFeasible || failureResult.type === FailureType.ConfigurationConflict;
            if (!isValueNotPossible) {
                showMakeDecisionFailure();
            } else if (props.explain !== "disabled") {
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
              prefix={implicitLabelPrefix(attribute, props.implicitLabelPrefix)}
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

const implicitLabelPrefix = (a: NumericAttribute, prefix: string) =>
    a.decision?.kind === DecisionKind.Implicit ? prefix : ""

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
