import styled from "styled-components";
import useExplainProcess from "../../../hooks/useExplainProcess";
import AttributeList from "../common/AttributeList";
import ShowMoreButton from "./ShowMoreButton";
import ApplySolutionButton from "../common/ApplySolutionButton";
import InfoMessage from "../common/InfoMessage";
import {useExplainPopoverProps} from "../../../props/explain/explainPopoverProps";
import {getStaticTextStyle} from "../../../props/staticTextProps";

const SolutionTitle = styled.div`
    margin-bottom: var(--space-xs);
`

const Separator = styled.div`
    height: 1px;
    background-color: var(--color-explain-popover-list-separator);
    margin-left: calc(var(--size-explain-popover-box-padding-left) * -1);
    margin-right: calc(var(--size-explain-popover-box-padding-right) * -1);

    @media only screen and (min-resolution: 2dppx) {
        height: 0.5px;
    }
`

const Actions = styled.div`
    display: flex;
    flex-direction: column;
    container: explain-actions / inline-size;
`

const StyledAttributeList = styled(AttributeList)`
    display: grid;
    grid-template-columns: [name] minmax(100px, auto) [values] minmax(100px, 1fr);
    gap: var(--space-sm);
    padding-top: var(--space-xs);
    padding-bottom: var(--space-xs);
    padding-right: var(--size-explain-popover-box-padding-right);
    margin-right: calc(var(--size-explain-popover-box-padding-right) * -1);
    overflow: auto;
    max-height: 200px;
`

const StyledApplySolutionButton = styled(ApplySolutionButton)`
    align-self: stretch;

    @container explain-actions (min-width: 300px) {
        align-self: center;
    }
`

const StyledInfoMessage = styled(InfoMessage)`
    width: min-content;
    min-width: 300px;
`

export default function ExplainContent() {
    const {decisionExplanations, constraintExplanations, hasError} = useExplainProcess();
    const {subline} = useExplainPopoverProps();

    if (hasError) {
        return <StyledInfoMessage variant="failedToExplain"/>
    }

    const explanation = decisionExplanations[0];
    if (!explanation) {
        return <StyledInfoMessage variant="noExplanationFound"/>
    }

    if (!explanation.solution) {
        return <StyledInfoMessage variant="noSolutionFound"/>
    }

    const desiredDecisions = explanation.solution.decisions.filter(d => d.state != null);
    return (
        <>
            <SolutionTitle style={getStaticTextStyle(subline)}>{subline.staticText}</SolutionTitle>

            <Separator/>
            <StyledAttributeList blockingDecisions={explanation.causedByDecisions} desiredDecisions={desiredDecisions}/>
            <Separator/>

            <Actions>
                <StyledApplySolutionButton explanation={explanation}/>

                {(decisionExplanations.length > 1 || constraintExplanations.length > 0) && <ShowMoreButton/>}
            </Actions>
        </>
    );
}