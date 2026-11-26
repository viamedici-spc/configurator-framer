import type { CausedByDecision, ExplicitDecision} from "@viamedici-spc/configurator-ts";
import {AttributeType, ComponentDecisionState} from "@viamedici-spc/configurator-ts";
import {match, P} from "ts-pattern";
import type {ChoiceValueNames} from "../../../hooks/localization";
import type {CommonExplainProps} from "../../../props/explain/commonExplainProps";

export default function getDecisionStateDisplayName(decision: ExplicitDecision | CausedByDecision, choiceValueNames: ChoiceValueNames, commonExplainProps: CommonExplainProps): string {
    return match(decision)
        .returnType<string>()
        .with({type: AttributeType.Choice}, m => choiceValueNames.get(m.choiceValueId) ?? m.choiceValueId)
        // Not reached: getExplainAttributes leaves out decisions without a state.
        .with({state: P.nullish}, () => "")
        .with({type: AttributeType.Boolean, state: true}, () => commonExplainProps.attributeValue.booleanDecisionStateTrueLabel)
        .with({type: AttributeType.Boolean, state: false}, () => commonExplainProps.attributeValue.booleanDecisionStateFalseLabel)
        .with({type: AttributeType.Component, state: ComponentDecisionState.Included}, () => commonExplainProps.attributeValue.componentDecisionStateIncludedLabel)
        .with({type: AttributeType.Component, state: ComponentDecisionState.Excluded}, () => commonExplainProps.attributeValue.componentDecisionStateExcludedLabel)
        .with({type: AttributeType.Numeric, state: P.number}, m => m.state.toString())
        .exhaustive();
}