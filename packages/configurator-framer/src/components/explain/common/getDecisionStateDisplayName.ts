import {AttributeType, CausedByDecision, ExplicitDecision} from "@viamedici-spc/configurator-ts";
import {match} from "ts-pattern";

export default function getDecisionStateDisplayName(decision: ExplicitDecision | CausedByDecision): string {
    return match(decision)
        .returnType<string>()
        .with({type: AttributeType.Choice}, m => m.choiceValueId)
        .with({type: AttributeType.Boolean}, m => m.state.toString())
        .with({type: AttributeType.Component}, m => m.state)
        .with({type: AttributeType.Numeric}, m => m.state.toString())
        .exhaustive();
}