import {DecisionExplanation, ExplicitDecision, CausedByDecision, GlobalAttributeId} from "@viamedici-spc/configurator-ts";
import {constTrue, Ord, pipe, RA, RNEA, RR, Str} from "@viamedici-spc/fp-ts-extensions";
import {globalAttributeIdToString} from "../../../common/GlobalAttributeIdExtensions";
import {match} from "ts-pattern";

export type DecisionIntention = "add" | "remove";

export type ExplainAttributeDecision = (CausedByDecision | ExplicitDecision) & {
    intention: DecisionIntention
};

export type ExplainAttribute = {
    key: string,
    attributeId: GlobalAttributeId,
    decisions: ReadonlyArray<ExplainAttributeDecision>
};

export type ExplainIntentionFilter = "any" | "add" | "remove";

const ordAttributeByLocalId = pipe(
    Str.Ord,
    Ord.contramap((a: ExplainAttribute) => a.attributeId.localId)
);

export function getExplainAttributes(
    explanation: DecisionExplanation,
    intentionFilter: ExplainIntentionFilter = "any"
): ReadonlyArray<ExplainAttribute> {
    const desiredDecisions = explanation.solution?.decisions?.filter(d => d.state != null) ?? [];
    const blockingDecisions = explanation.causedByDecisions ?? [];
    const decisions = [
        ...desiredDecisions.map(d => ({...d, intention: "add"} satisfies ExplainAttributeDecision)),
        ...blockingDecisions.map(d => ({...d, intention: "remove"} satisfies ExplainAttributeDecision))
    ];

    const filterPredicate = match(intentionFilter)
        .with("add", () => (d: ExplainAttributeDecision) => d.intention === "add")
        .with("remove", () => (d: ExplainAttributeDecision) => d.intention === "remove")
        .otherwise(() => constTrue);

    return pipe(
        decisions,
        RA.filter(filterPredicate),
        RNEA.groupBy(d => globalAttributeIdToString(d.attributeId)),
        RR.collect(Ord.trivial)((k, v) => ({
            key: k,
            attributeId: RNEA.head(v).attributeId,
            decisions: v
        } satisfies ExplainAttribute)),
        RA.sort(ordAttributeByLocalId)
    );
}
