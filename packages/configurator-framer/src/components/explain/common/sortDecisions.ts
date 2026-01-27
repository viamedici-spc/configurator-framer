import {Ord, pipe, RA, Str} from "@viamedici-spc/fp-ts-extensions";
import {ChoiceValueNames} from "../../../hooks/localization";
import {ExplainAttributeDecision} from "./explainAttributes";
import {CommonExplainProps} from "../../../props/explain/commonExplainProps";
import getDecisionStateDisplayName from "./getDecisionStateDisplayName";

export default function sortDecisions(
    decisions: ReadonlyArray<ExplainAttributeDecision>,
    choiceValueNames: ChoiceValueNames,
    commonExplainProps: CommonExplainProps
): ReadonlyArray<ExplainAttributeDecision> {
    const ordDecisionByChoiceValue = pipe(
        Str.Ord,
        Ord.contramap((d: ExplainAttributeDecision) => getDecisionStateDisplayName(d, choiceValueNames, commonExplainProps))
    );

    return pipe(
        decisions,
        RA.sort(ordDecisionByChoiceValue)
    );
}
