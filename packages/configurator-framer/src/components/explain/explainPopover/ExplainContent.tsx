import styled from "styled-components";
import useExplainProcess from "../../../hooks/useExplainProcess";
import AttributeList from "../common/AttributeList";
import ShowMoreButton from "./ShowMoreButton";
import ApplySolutionButton from "../common/ApplySolutionButton";
import InfoMessage from "../common/InfoMessage";
import {useExplainPopoverProps} from "../../../props/explainPopoverProps";

const SolutionTitle = styled.div`
    font-weight: 500;
    font-family: var(--font-heading);
    margin-bottom: var(--space-xs);
`

const Separator = styled.div`
    height: 1px;
    background-color: var(--color-explain-popover-list-separator);
    margin-left: -1.1em;
    margin-right: -1.1em;

    @media only screen and (min-resolution: 2dppx) {
        height: 0.5px;
    }
`

const Actions = styled.div`
    container: explain-actions / inline-size;
`

const StyledAttributeList = styled(AttributeList)`
    display: grid;
    grid-template-columns: [name] minmax(100px, auto) [values] minmax(100px, 1fr);
    gap: var(--space-sm);
    padding-top: var(--space-xs);
    padding-bottom: var(--space-xs);
    padding-right: 1.1em;
    margin-right: -1.1em;
    overflow: auto;
    max-height: 200px;
`

const StyledApplySolutionButton = styled(ApplySolutionButton)`
    border-radius: 360px;
    background-color: var(--color-explain-popover-apply-solution-button-fill);
    color: var(--color-explain-popover-apply-solution-button-color);
    font-size: 0.9em;
    font-family: var(--framer-font-family, "Inter", "Inter Placeholder", sans-serif);
    font-weight: 600;
    appearance: none;
    padding: 0.6em 2em;
    border: none;
    width: 100%;
    margin-top: 1.1em;

    &:focus {
        outline: 2px solid var(--color-explain-popover-apply-solution-button-outline);
        outline-offset: 1px;
    }

    // The Webstorm formatter doesn't support container queries and would be break it.
    // @formatter:off
@container explain-actions (min-width: 300px) {
    width: auto;
}
`
// @formatter:on

const StyledInfoMessage = styled(InfoMessage)`
    width: min-content;
    min-width: 300px;
`

export default function ExplainContent() {
    const {decisionExplanations, constraintExplanations, hasError} = useExplainProcess();
    const {solutionTitle, applySolutionButtonCaption} = useExplainPopoverProps();


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
            <SolutionTitle>{solutionTitle}</SolutionTitle>

            <Separator/>
            <StyledAttributeList blockingDecisions={explanation.causedByDecisions} desiredDecisions={desiredDecisions}/>
            <Separator/>

            <Actions>
                <StyledApplySolutionButton explanation={explanation}>
                    {applySolutionButtonCaption}
                </StyledApplySolutionButton>

                {(decisionExplanations.length > 1 || constraintExplanations.length > 0) && <ShowMoreButton/>}
            </Actions>
        </>
    );
}