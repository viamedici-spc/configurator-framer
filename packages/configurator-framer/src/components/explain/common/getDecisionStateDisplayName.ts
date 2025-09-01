import {AttributeType, CausedByDecision, ComponentDecisionState, ExplainQuestionSubject, ExplicitDecision} from "@viamedici-spc/configurator-ts";
import {match} from "ts-pattern";
import {ChoiceValueNames} from "../../../hooks/localization";
import {CommonExplainProps} from "../../../props/explain/commonExplainProps";

export default function getDecisionStateDisplayName(decision: ExplicitDecision | CausedByDecision, choiceValueNames: ChoiceValueNames, commonExplainProps: CommonExplainProps): string {
    return match(decision)
        .returnType<string>()
        .with({type: AttributeType.Choice}, m => choiceValueNames.get(m.choiceValueId) ?? m.choiceValueId)
        .with({type: AttributeType.Boolean, state: true}, () => commonExplainProps.attributeValue.booleanDecisionStateTrueLabel)
        .with({type: AttributeType.Boolean, state: false}, () => commonExplainProps.attributeValue.booleanDecisionStateFalseLabel)
        .with({type: AttributeType.Component, state: ComponentDecisionState.Included}, () => commonExplainProps.attributeValue.componentDecisionStateIncludedLabel)
        .with({type: AttributeType.Component, state: ComponentDecisionState.Excluded}, () => commonExplainProps.attributeValue.componentDecisionStateExcludedLabel)
        .with({type: AttributeType.Numeric}, m => m.state.toString())
        .exhaustive();
}