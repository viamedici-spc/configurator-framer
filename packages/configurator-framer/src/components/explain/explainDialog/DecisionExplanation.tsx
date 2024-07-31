import ApplySolutionButton from "../common/ApplySolutionButton";
import {DecisionExplanation} from "@viamedici-spc/configurator-ts";
import styled from "styled-components";
import AttributeList from "../common/AttributeList";
import ExplanationCard from "./ExplanationCard";
import {useExplainDialogProps} from "../../../props/explainDialogProps";

const StyledAttributeList = styled(AttributeList)`
    display: grid;
    grid-template-columns: [name] minmax(150px, auto) [values] minmax(0px, 1fr);
    gap: var(--space-sm);
`

const StyledApplySolutionButton = styled(ApplySolutionButton)`
    border-radius: var(--shape-border-radius-sm);
    background-color: var(--color-explain-dialog-apply-solution-button-fill);
    color: var(--color-explain-dialog-apply-solution-button-color);
    font-size: 0.9em;
    font-family: var(--framer-font-family, "Inter", "Inter Placeholder", sans-serif);
    font-weight: 600;
    appearance: none;
    padding: 0.6em 1em;
    border: none;
    width: auto;
    margin-top: var(--space-md);

    &:focus {
        outline: 2px solid var(--color-explain-dialog-apply-solution-button-outline);
        outline-offset: 1px;
    }
`

export default function DecisionExplanation(props: { explanation: DecisionExplanation }) {
    const {explanation} = props;
    const {applySolutionButtonCaption} = useExplainDialogProps();
    const desiredDecisions = explanation.solution.decisions.filter(d => d.state != null);

    return (
        <ExplanationCard>
            <StyledAttributeList blockingDecisions={explanation.causedByDecisions} desiredDecisions={desiredDecisions}/>
            <StyledApplySolutionButton explanation={explanation}>
                {applySolutionButtonCaption}
            </StyledApplySolutionButton>
        </ExplanationCard>
    )
}