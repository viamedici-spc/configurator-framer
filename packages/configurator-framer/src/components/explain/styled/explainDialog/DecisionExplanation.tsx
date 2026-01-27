import ApplySolutionButton from "../common/ApplySolutionButton";
import {DecisionExplanation} from "@viamedici-spc/configurator-ts";
import styled from "styled-components";
import AttributeList from "../common/AttributeList";
import {useExplainDialogProps} from "../../../../props/explain/explainDialogProps";
import {getBoxStyle} from "../../../../props/boxProps";
import {getMarginStyle} from "../../../../props/marginProps";
import {getExplainAttributes} from "../../common/explainAttributes";

const StyledAttributeList = styled(AttributeList)`
    display: grid;
    grid-template-columns: [name] minmax(150px, auto) [values] minmax(0px, 1fr);
    gap: var(--space-sm);
`

export default function DecisionExplanation(props: { explanation: DecisionExplanation }) {
    const {explanation} = props;
    const {explanationCard} = useExplainDialogProps();
    const attributes = getExplainAttributes(explanation);

    return (
        <div style={{...getBoxStyle(explanationCard), ...getMarginStyle(explanationCard)}}>
            <StyledAttributeList attributes={attributes}/>
            <ApplySolutionButton explanation={explanation}/>
        </div>
    )
}
