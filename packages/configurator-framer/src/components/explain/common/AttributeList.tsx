import {CausedByDecision, ExplicitDecision, GlobalAttributeId} from "@viamedici-spc/configurator-ts";
import {Ord, pipe, RA, ReadonlyNonEmptyArray, RNEA, RR, Str} from "@viamedici-spc/fp-ts-extensions";
import Attribute from "./Attribute";
import {globalAttributeIdToString} from "../../../common/GlobalAttributeIdExtensions";
import {HTMLProps} from "react";
import {Decision} from "./AttributeValue";

type Props = HTMLProps<HTMLDivElement> & {
    blockingDecisions: ReadonlyArray<CausedByDecision>,
    desiredDecisions: ReadonlyArray<ExplicitDecision>
}
type GroupedAttribute = {
    key: string,
    attributeId: GlobalAttributeId,
    decisions: ReadonlyNonEmptyArray<Decision>
};

const ordAttributeByLocalId = pipe(
    Str.Ord,
    Ord.contramap((a: GroupedAttribute) => a.attributeId.localId)
);

export default function AttributeList(props: Props) {
    const {blockingDecisions, desiredDecisions, ...restProps} = props;
    const attributes = pipe(
        [
            ...desiredDecisions.map(d => ({...d, intention: "add"} satisfies Decision)),
            ...blockingDecisions.map(d => ({...d, intention: "remove"} satisfies Decision))
        ],
        RNEA.groupBy(d => globalAttributeIdToString(d.attributeId)),
        RR.collect(Ord.trivial)((k, v) => ({key: k, attributeId: RNEA.head(v).attributeId, decisions: v} satisfies GroupedAttribute)),
        RA.sort(ordAttributeByLocalId)
    );

    return (
        <div {...restProps}>
            {attributes.map(a => <Attribute key={a.key} decisions={a.decisions}/>)}
        </div>
    )
}