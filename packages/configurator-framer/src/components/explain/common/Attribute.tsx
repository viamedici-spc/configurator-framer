import {Ord, pipe, RA, ReadonlyNonEmptyArray, Str} from "@viamedici-spc/fp-ts-extensions";
import {AttributeValue, Decision} from "./AttributeValue";
import styled from "styled-components";
import getDecisionStateDisplayName from "./getDecisionStateDisplayName";
import {useAttributeName, useChoiceValueNames} from "../../../hooks/localization";
import useCommonExplainProps from "../../../props/useCommonExplainProps";

const Root = styled.div`
    display: grid;
    grid-template-columns: subgrid;
    grid-column: span 2;
    align-items: center;
`

const AttributeName = styled.div`
    grid-area: name;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`

const AttributeValues = styled.div`
    grid-area: values;
    display: flex;
    flex-wrap: wrap;
    min-width: 0;
    gap: var(--space-xxs);
`

export default function Attribute(props: { decisions: ReadonlyNonEmptyArray<Decision> }) {
    const {decisions} = props;
    const attributeId = decisions[0].attributeId;
    const choiceValueNames = useChoiceValueNames(attributeId);
    const attributeName = useAttributeName(attributeId)
    const commonExplainProps = useCommonExplainProps();

    const ordDecisionByChoiceValue = pipe(
        Str.Ord,
        Ord.contramap((d: Decision) => getDecisionStateDisplayName(d, choiceValueNames, commonExplainProps))
    );

    const sortedDecisions = pipe(
        decisions,
        RA.sort(ordDecisionByChoiceValue)
    );

    return (
        <Root>
            <AttributeName>
                {attributeName ?? attributeId.localId}
            </AttributeName>
            <AttributeValues>
                {sortedDecisions.map((d, i) => <AttributeValue key={i} decision={d} choiceValuesNames={choiceValueNames}/>)}
            </AttributeValues>
        </Root>
    )
}