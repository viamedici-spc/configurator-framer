import {addPropertyControls, PropertyControls} from "framer"
import styled from "styled-components"
import {ChoiceValueDecisionState, ChoiceValueId, ConfiguratorError, ConfiguratorErrorType, DecisionKind,} from "@viamedici-spc/configurator-ts"
import {useChoiceAttribute} from "@viamedici-spc/configurator-react"
import useRenderPlaceholder from "../hooks/useRenderPlaceholder";
import {getSelectStyle, selectPropertyControls, SelectProps} from "../props/selectProps";
import parseGlobalAttributeId from "../common/parseGlobalAttributeId";
import useExplain from "../hooks/useExplain";
import {explainableComponent} from "../common/componentComposites";
import {useControlId} from "../common/controlId";
import {showMakeDecisionFailure} from "../common/failureAlerts";
import useSortedChoiceValues from "../hooks/useSortedChoiceValues";
import {useChoiceValueNames} from "../hooks/localization";

const Root = styled.select`
    color: inherit;
    cursor: inherit;
`

const resetValue = "<reset>";
const nothingValue = "<nothing>";

type Props = SelectProps;

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
    const {attribute, makeDecision, clearDecisions, isMultiSelect, getIncludedChoiceValues, getBlockedChoiceValues, getAllowedChoiceValues} = choiceAttribute;
    const blockedChoiceValuesRaw = getBlockedChoiceValues();
    const allowedChoiceValues = useSortedChoiceValues(globalAttributeId, getAllowedChoiceValues());
    const blockedChoiceValues = useSortedChoiceValues(globalAttributeId, blockedChoiceValuesRaw.filter(v => !v.isPossibleDecisionStatesImmutable));
    const unavailableChoiceValues = useSortedChoiceValues(globalAttributeId, blockedChoiceValuesRaw.filter(v => v.isPossibleDecisionStatesImmutable));
    const selectedChoiceValues = getIncludedChoiceValues();
    const selectedChoiceValueIds = selectedChoiceValues.map((a) => a.id);
    const selectedChoiceValueId = selectedChoiceValueIds[0] ?? nothingValue;
    const canReset = selectedChoiceValues.some(v => v.decision?.kind === DecisionKind.Explicit);
    const hasSelections = selectedChoiceValueIds.length >= 1;
    const isImplicitSelected = selectedChoiceValues.some(v => v.decision?.kind === DecisionKind.Implicit && !v.isPossibleDecisionStatesImmutable);
    const isFixedSelected = selectedChoiceValues.some(v => v.decision?.kind === DecisionKind.Implicit && v.isPossibleDecisionStatesImmutable);
    // All values blocked from inclusion (mutable + immutable bundled). Triggers
    // the `allOptionsBlockedColors` styling override. Explain may still help on
    // the mutably blocked subset, so the dropdown stays openable in this case.
    const allOptionsBlocked = allowedChoiceValues.length === 0;
    // Stricter subset: every blocked value is also immutable — nothing is
    // Explainable. Triggers the `noOptionsAvailableColors` styling override and,
    // when the designer opts in via `excludeUnavailable`, the whole-element
    // `disabled` attribute (browser default disabled styling takes over).
    const noOptionsAvailable = allOptionsBlocked && blockedChoiceValues.length === 0;
    const isSelectDisabled = props.excludeUnavailableOptions && noOptionsAvailable;

    const onChange = async (choiceValueId: ChoiceValueId) => {
        const explainMode = props.explain;
        const maybeExplain = explainMode !== "disabled" && (() => explain(
            b => b.whyIsStateNotPossible.choice(attribute.id).choiceValue(choiceValueId).state(ChoiceValueDecisionState.Included),
            explainMode, controlId
        ));

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
            } catch (e) {
                const error = e as ConfiguratorError;
                if (error.type === ConfiguratorErrorType.ConflictWithConsequence && maybeExplain) {
                    await maybeExplain();
                    return;
                }
                showMakeDecisionFailure();
            }
        } else if (blockedChoiceValues.some((v) => v.id === choiceValueId) && maybeExplain) {
            await maybeExplain();
        }
    }

    const style = getSelectStyle(props, attribute.isSatisfied, isImplicitSelected, isFixedSelected, allOptionsBlocked, noOptionsAvailable);

    return (
        <Root ref={ref}
              value={isMultiSelect() ? selectedChoiceValueIds : selectedChoiceValueId}
              multiple={isMultiSelect()}
              onChange={(e) => onChange(e.currentTarget.value)}
              disabled={isSelectDisabled}
              style={style}>

            {!hasSelections && !isMultiSelect() && (
                <option value={nothingValue}>
                </option>
            )}

            {canReset && (
                <option value={resetValue}>
                    {props.resetLabel}
                </option>
            )}

            {allowedChoiceValues.map((v) => {
                const isFixed = v.decision?.kind === DecisionKind.Implicit && v.isPossibleDecisionStatesImmutable;
                const isImplicit = v.decision?.kind === DecisionKind.Implicit && !v.isPossibleDecisionStatesImmutable;
                return (
                    <option key={v.id} value={v.id}>
                        {isFixed ? props.fixedLabelPrefix : isImplicit ? props.implicitLabelPrefix : ""}
                        {choiceValueNames.get(v.id) ?? v.id}
                    </option>
                );
            })}

            {blockedChoiceValues.length > 0 && (
                <optgroup label={props.blockedLabel}>
                    {blockedChoiceValues.map((v) => (
                        <option key={v.id} value={v.id}>
                            {choiceValueNames.get(v.id) ?? v.id}
                        </option>
                    ))}
                </optgroup>
            )}

            {!props.excludeUnavailableOptions && unavailableChoiceValues.length > 0 && (
                <optgroup label={props.unavailableLabel}>
                    {unavailableChoiceValues.map((v) => (
                        <option key={v.id} value={v.id} disabled>
                            {choiceValueNames.get(v.id) ?? v.id}
                        </option>
                    ))}
                </optgroup>
            )}
        </Root>
    )
})

export default ChoiceSelect;

const propertyControls: PropertyControls<Props> = {
    ...selectPropertyControls
}

addPropertyControls(ChoiceSelect, propertyControls);
