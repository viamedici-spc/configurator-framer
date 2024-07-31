import {addPropertyControls, PropertyControls} from "framer"
import styled from "styled-components"
import {AttributeInterpreter, ChoiceValueDecisionState, ChoiceValueId, DecisionKind,} from "@viamedici-spc/configurator-ts"
import {useChoiceAttribute} from "@viamedici-spc/configurator-react"
import useRenderPlaceholder from "../hooks/useRenderPlaceholder";
import {getSelectStyle, selectPropertyControls, SelectProps} from "../props/selectProps";
import parseGlobalAttributeId from "../common/parseGlobalAttributeId";
import {CSSProperties} from "react";
import {inputStateColorProperty, InputStateColors} from "../props/inputProps";
import {match, P} from "ts-pattern";
import useExplain from "../hooks/useExplain";
import {explainableComponent} from "../common/componentComposites";
import {useControlId} from "../common/controlId";
import {showMakeDecisionFailure} from "../common/failureAlerts";
import useSortedChoiceValues from "../hooks/useSortedChoiceValues";
import {useChoiceValueNames} from "../hooks/localization";

const Root = styled.select`
    color: inherit;
`

const resetValue = "<reset>";
const nothingValue = "<nothing>";

type Props = SelectProps & {
    noOptionsAvailableColors: InputStateColors
}

/**
 * @framerIntrinsicWidth 300
 * @framerIntrinsicHeight 35
 *
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight fixed
 */
const ChoiceSelect = explainableComponent<HTMLSelectElement, Props>((props, ref) => {
    const renderPlaceholder = useRenderPlaceholder();
    if (renderPlaceholder) {
        const style = getSelectStyle(props, true, false);
        return <Root style={style}/>
    }

    const controlId = useControlId();
    const globalAttributeId = parseGlobalAttributeId(props);
    const choiceAttribute = useChoiceAttribute(globalAttributeId);
    if (!choiceAttribute) {
        return <span>Choice Attribute not found</span>
    }

    const {explain} = useExplain();
    const choiceValueNames = useChoiceValueNames(globalAttributeId);
    const {attribute, makeDecision, clearDecisions} = choiceAttribute;
    const allowedChoiceValues = useSortedChoiceValues(globalAttributeId, choiceValueNames, AttributeInterpreter.getAllowedChoiceValues(attribute));
    const blockedChoiceValues = useSortedChoiceValues(globalAttributeId, choiceValueNames, AttributeInterpreter.getBlockedChoiceValues(attribute));
    const isMultiselect = AttributeInterpreter.isMultiSelect(attribute);
    const selectedChoiceValues = AttributeInterpreter.getSelectedChoiceValues(attribute);
    const selectedChoiceValueIds = selectedChoiceValues.map((a) => a.id);
    const selectedChoiceValueId = selectedChoiceValueIds[0] ?? nothingValue;
    const canReset = selectedChoiceValues.some(v => v.decision?.kind === DecisionKind.Explicit);
    const hasSelections = selectedChoiceValueIds.length >= 1;
    const isImplicitSelected = selectedChoiceValues.some(v => v.decision?.kind === DecisionKind.Implicit);
    const noOptionsAvailable = allowedChoiceValues.length === 0;

    const onChange = async (choiceValueId: ChoiceValueId) => {
        if (choiceValueId === resetValue) {
            try {
                await clearDecisions();
            } catch {
                showMakeDecisionFailure();
            }
        } else if (allowedChoiceValues.some((v) => v.id === choiceValueId)) {
            const state = selectedChoiceValueIds.some((v) => v === choiceValueId)
                ? undefined
                : ChoiceValueDecisionState.Included

            try {
                await makeDecision(choiceValueId, state);
            } catch {
                showMakeDecisionFailure();
            }
        } else if (blockedChoiceValues.some((v) => v.id === choiceValueId) && props.explain !== "disabled") {
            await explain(
                b => b.whyIsStateNotPossible.choice(attribute.id).choiceValue(choiceValueId).state(ChoiceValueDecisionState.Included),
                props.explain, controlId
            );
        }
    }

    const style = getStyle(props, attribute.isSatisfied, isImplicitSelected, noOptionsAvailable);

    return (
        <Root ref={ref}
              value={isMultiselect ? selectedChoiceValueIds : selectedChoiceValueId}
              multiple={isMultiselect}
              onChange={(e) => onChange(e.currentTarget.value)}
              style={style}>

            {!hasSelections && !isMultiselect && (
                <option value={nothingValue}>
                </option>
            )}

            {canReset && (
                <option value={resetValue}>
                    {props.resetLabel}
                </option>
            )}

            {allowedChoiceValues.map((v) => (
                <option key={v.id} value={v.id}>
                    {v.decision?.kind === DecisionKind.Implicit ? props.implicitLabelPrefix : ""}
                    {choiceValueNames[v.id] ?? v.id}
                </option>
            ))}

            {blockedChoiceValues.length > 0 && (
                <optgroup label={props.blockedLabel}>
                    {blockedChoiceValues.map((v) => (
                        <option key={v.id} value={v.id}>
                            {choiceValueNames[v.id] ?? v.id}
                        </option>
                    ))}
                </optgroup>
            )}
        </Root>
    )
})

export default ChoiceSelect;

const propertyControls: PropertyControls<Props> = {
    ...selectPropertyControls,
    noOptionsAvailableColors: {
        ...inputStateColorProperty,
        title: "No Options Available Colors"
    }
}

addPropertyControls(ChoiceSelect, propertyControls);

const getStyle = (props: Props, isSatisfied: boolean, isImplicitSelected: boolean, noOptionsAvailable: boolean): CSSProperties => {
    const baseStyle = getSelectStyle(props, isSatisfied, isImplicitSelected);
    return ({
        ...baseStyle,
        backgroundColor: match({
            noOptionsAvailable,
            noOptionsAvailableFill: props.noOptionsAvailableColors?.fill
        })
            .with({noOptionsAvailable: true, noOptionsAvailableFill: P.string.minLength(1)}, p => p.noOptionsAvailableFill)
            .otherwise(() => baseStyle.backgroundColor),
        borderColor: match({
            noOptionsAvailable,
            noOptionsAvailableBorderColor: props.noOptionsAvailableColors?.borderColor
        })
            .with({noOptionsAvailable: true, noOptionsAvailableBorderColor: P.string.minLength(1)}, p => p.noOptionsAvailableBorderColor)
            .otherwise(() => baseStyle.borderColor),
        color: match({
            noOptionsAvailable,
            noOptionsAvailableColor: props.noOptionsAvailableColors?.color
        })
            .with({noOptionsAvailable: true, noOptionsAvailableColor: P.string.minLength(1)}, p => p.noOptionsAvailableColor)
            .otherwise(() => baseStyle.color)
    });
}
