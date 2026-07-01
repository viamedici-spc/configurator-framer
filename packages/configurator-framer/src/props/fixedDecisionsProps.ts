import {ControlType, PropertyControls} from "framer";
import {attributeIdPropertyControls, AttributeIdProps} from "./attributeIdProps";
import {choiceValueIdPropertyControls, ChoiceValueIdProps} from "./choiceValueIdProps";
import {AttributeType, ChoiceValueDecisionState, ComponentDecisionState, FixedDecision} from "@viamedici-spc/configurator-ts";
import parseGlobalAttributeId from "../common/parseGlobalAttributeId";
import {match} from "ts-pattern";

// The state to fix, without "undefined" — a fixed decision requires a concrete value (there is no reset).
type FixedDecisionState = "included" | "excluded" | "true" | "false" | "numeric";

export type FixedDecisionItemProps = AttributeIdProps & ChoiceValueIdProps & {
    state: FixedDecisionState,
    // Only relevant when state is "numeric"; optional so non-numeric decisions can omit it.
    numericValue?: number,
};

export type FixedDecisionsProps = {
    fixedDecisions: FixedDecisionItemProps[]
};

/**
 * Maps a single native property-controls item to a domain {@link FixedDecision}.
 *
 * Fixed decisions are built while constructing the SessionContext — before any session exists — so the
 * attribute type cannot be queried and is derived from the props alone: "true"/"false" ⇒ Boolean,
 * "numeric" ⇒ Numeric, and "included"/"excluded" ⇒ Choice when a choiceValueId is present (a Choice decision
 * always carries one) or Component otherwise.
 *
 * Returns null for incomplete/invalid items (e.g. missing attribute id); these are filtered out by the caller.
 */
export function mapFixedDecision(p: FixedDecisionItemProps): FixedDecision | null {
    if (!p.attributeId) {
        return null;
    }
    const attributeId = parseGlobalAttributeId(p);
    const choiceValueId = p.choiceValueId ?? "";
    const hasChoiceValueId = choiceValueId.length > 0;

    return match({state: p.state, hasChoiceValueId})
        .returnType<FixedDecision | null>()
        .with({state: "included", hasChoiceValueId: true}, () => ({type: AttributeType.Choice, attributeId, choiceValueId, state: ChoiceValueDecisionState.Included}))
        .with({state: "excluded", hasChoiceValueId: true}, () => ({type: AttributeType.Choice, attributeId, choiceValueId, state: ChoiceValueDecisionState.Excluded}))
        .with({state: "included", hasChoiceValueId: false}, () => ({type: AttributeType.Component, attributeId, state: ComponentDecisionState.Included}))
        .with({state: "excluded", hasChoiceValueId: false}, () => ({type: AttributeType.Component, attributeId, state: ComponentDecisionState.Excluded}))
        .with({state: "true"}, () => ({type: AttributeType.Boolean, attributeId, state: true}))
        .with({state: "false"}, () => ({type: AttributeType.Boolean, attributeId, state: false}))
        .with({state: "numeric"}, () => ({type: AttributeType.Numeric, attributeId, state: p.numericValue ?? 0}))
        .otherwise(() => null);
}

export const fixedDecisionsPropertyControls = {
    fixedDecisions: {
        title: "Fixed Decisions",
        type: ControlType.Array,
        control: {
            type: ControlType.Object,
            controls: {
                ...attributeIdPropertyControls,
                ...choiceValueIdPropertyControls,
                state: {
                    title: "State",
                    type: ControlType.Enum,
                    defaultValue: "included",
                    options: ["included", "excluded", "true", "false", "numeric"],
                },
                numericValue: {
                    title: "Numeric Value",
                    type: ControlType.Number,
                    defaultValue: 0,
                }
            }
        }
    }
} satisfies PropertyControls<FixedDecisionsProps>;
