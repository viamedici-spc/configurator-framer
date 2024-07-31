import {AttributeType, CausedByDecision, ComponentDecisionState, ExplainQuestionSubject, ExplicitDecision} from "@viamedici-spc/configurator-ts";
import {match} from "ts-pattern";
import {ChoiceValueNames} from "../../../hooks/localization";
import {CommonExplainProps} from "../../../props/commonExplainProps";

export default function getDecisionStateDisplayName(decision: ExplicitDecision | CausedByDecision, choiceValueNames: ChoiceValueNames, commonExplainProps: CommonExplainProps): string {
    return match(decision)
        .returnType<string>()
        .with({type: AttributeType.Choice}, m => choiceValueNames[m.choiceValueId] ?? m.choiceValueId)
        .with({type: AttributeType.Boolean, state: true}, () => commonExplainProps.booleanDecisionStateTrueLabel)
        .with({type: AttributeType.Boolean, state: false}, () => commonExplainProps.booleanDecisionStateFalseLabel)
        .with({type: AttributeType.Component, state: ComponentDecisionState.Included}, () => commonExplainProps.componentDecisionStateIncludedLabel)
        .with({type: AttributeType.Component, state: ComponentDecisionState.Excluded}, () => commonExplainProps.componentDecisionStateExcludedLabel)
        .with({type: AttributeType.Numeric}, m => m.state.toString())
        .exhaustive();
}