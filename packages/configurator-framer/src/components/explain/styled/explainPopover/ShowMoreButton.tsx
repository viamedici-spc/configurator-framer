import useExplainProcess from "../../../../hooks/useExplainProcess";
import styled from "styled-components";
import {useExplainPopoverProps} from "../../../../props/explain/explainPopoverProps";
import {useMemo} from "react";
import Mustache from "mustache";
import {getButtonStyle} from "../../../../props/buttonProps";
import {getMarginStyle} from "../../../../props/marginProps";

const Root = styled.button`
    appearance: none;
    border: none;
    text-decoration: underline;
    cursor: pointer;
    align-self: center;

    &:hover {
        background-color: var(--color-button-fill-hover) !important;
    }

    &:focus {
        outline: var(--size-button-focus-outline) solid var(--color-button-focus-outline);
        outline-offset: var(--size-button-focus-outline-offset);
    }
`

export default function ShowMoreButton() {
    const {decisionExplanations, switchMode} = useExplainProcess();
    const {showMoreButton, showConstraintsButton} = useExplainPopoverProps();
    const more = decisionExplanations.length - 1;
    const showMoreText = useMemo(() => more > 0 && Mustache.render(showMoreButton.staticText, {amount: more}), [showMoreButton.text, more])
    const activeProps = more > 0 ? showMoreButton : showConstraintsButton;

    return (
        <Root onClick={() => switchMode("dialog")} style={{
            ...getButtonStyle(activeProps),
            ...getMarginStyle(activeProps)
        }}>
            {showMoreText || activeProps.staticText}
        </Root>
    )
}