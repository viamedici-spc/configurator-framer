import {AttributeValue} from "./AttributeValue";
import styled from "styled-components";
import {useAttributeName, useChoiceValueNames} from "../../../../hooks/localization";
import useCommonExplainProps from "../../../../props/useCommonExplainProps";
import {getTextStyle} from "../../../../props/textProps";
import {ExplainAttributeDecision} from "../../common/explainAttributes";
import sortDecisions from "../../common/sortDecisions";

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

export default function Attribute(props: { decisions: ReadonlyArray<ExplainAttributeDecision> }) {
    const {decisions} = props;
    const attributeId = decisions[0].attributeId;
    const choiceValueNames = useChoiceValueNames(attributeId);
    const attributeName = useAttributeName(attributeId)
    const commonExplainProps = useCommonExplainProps();

    const sortedDecisions = sortDecisions(decisions, choiceValueNames, commonExplainProps);

    return (
        <Root>
            <AttributeName style={getTextStyle(commonExplainProps.attributeName)}>
                {attributeName ?? attributeId.localId}
            </AttributeName>
            <AttributeValues>
                {sortedDecisions.map((d, i) => <AttributeValue key={i} decision={d} choiceValuesNames={choiceValueNames}/>)}
            </AttributeValues>
        </Root>
    )
}
