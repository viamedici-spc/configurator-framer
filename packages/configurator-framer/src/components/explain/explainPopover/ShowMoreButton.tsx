import useExplainProcess from "../../../hooks/useExplainProcess";
import styled from "styled-components";

const Root = styled.div`
    display: flex;
    justify-content: center;

    // The Webstorm formatter doesn't support container queries and would be break it.
    // @formatter:off
@container explain-actions (min-width: 300px) {
    justify-content: start;
}
`
// @formatter:on

const Button = styled.button`
    color: inherit;
    font-size: 0.9em;
    font-family: var(--framer-font-family, "Inter", "Inter Placeholder", sans-serif);
    font-weight: 500;
    appearance: none;
    border: none;
    border-radius: var(--shape-border-radius-xs);
    margin-top: 0.9em;
    text-decoration: underline;
    cursor: pointer;
    background-color: transparent;

    &:focus {
        outline: 2px solid var(--color-explain-popover-show-more-button-outline);
        outline-offset: 1px;
    }
`

export default function ShowMoreButton() {
    const {decisionExplanations, switchMode} = useExplainProcess();
    const more = decisionExplanations.length - 1;

    return (
        <Root>
            <Button onClick={() => switchMode("dialog")}>
                {more > 0 && <span>Show more ({more})</span>}
                {more === 0 && <span>Show Constraints</span>}
            </Button>
        </Root>
    )
}