import styled from "styled-components";
import useExplainProcess from "../../../hooks/useExplainProcess";
import DecisionExplanation from "./DecisionExplanation";
import ConstraintExplanation from "./ConstraintExplanation";
import InfoMessage from "../common/InfoMessage";

const GroupTitle = styled.div`
    font-weight: 500;
    font-family: var(--font-heading);
    margin-bottom: var(--space-xs);
    margin-left: var(--space-sm-fixed);
`

const Explanations = styled.div`
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
`

const Groups = styled.div`
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
`

const StyledInfoMessage = styled(InfoMessage)`
    width: min-content;
    min-width: 400px;
    margin: var(--space-sm-fixed) var(--space-md-fixed) var(--space-sm-fixed) var(--space-sm-fixed);
`

export default function ExplainContent() {
    const {decisionExplanations, constraintExplanations, hasError} = useExplainProcess();

    if (hasError) {
        return <StyledInfoMessage variant="failedToExplain"/>
    }

    if (decisionExplanations.length === 0 && constraintExplanations.length === 0) {
        return <StyledInfoMessage variant="noExplanationFound"/>
    }

    return (
        <Groups>
            {decisionExplanations.length > 0 && (
                <div>
                    <GroupTitle>Solutions</GroupTitle>
                    <Explanations>
                        {decisionExplanations.map(e => <DecisionExplanation key={decisionExplanations.indexOf(e)} explanation={e}/>)}
                    </Explanations>
                </div>
            )}

            {constraintExplanations.length > 0 && (
                <div>
                    <GroupTitle>Constraint Explanations</GroupTitle>
                    <Explanations>
                        {constraintExplanations.map(e => <ConstraintExplanation key={constraintExplanations.indexOf(e)} explanation={e}/>)}
                    </Explanations>
                </div>
            )}
        </Groups>
    );
}