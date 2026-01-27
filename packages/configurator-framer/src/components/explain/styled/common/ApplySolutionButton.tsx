import {DecisionExplanation} from "@viamedici-spc/configurator-ts";
import useExplainProcess from "../../../../hooks/useExplainProcess";
import {ButtonHTMLAttributes, DetailedHTMLProps} from "react";
import {getButtonStyle} from "../../../../props/buttonProps";
import styled from "styled-components";
import {getMarginStyle} from "../../../../props/marginProps";
import useCommonExplainProps from "../../../../props/useCommonExplainProps";

const Root = styled.button`
    appearance: none;
    cursor: pointer;

    &:hover {
        background-color: var(--color-button-fill-hover) !important;
    }

    &:focus {
        outline: var(--size-button-focus-outline) solid var(--color-button-focus-outline);
        outline-offset: var(--size-button-focus-outline-offset);
    }
`;

type Props = DetailedHTMLProps<Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children">, HTMLButtonElement> & { explanation: DecisionExplanation }

export default function ApplySolutionButton(props: Props) {
    const {explanation, ...restProps} = props;
    const process = useExplainProcess();
    const {applySolutionButton} = useCommonExplainProps();

    return (
        <Root {...restProps} onClick={() => process.applySolution(explanation.solution)} style={{
            ...getButtonStyle(applySolutionButton),
            ...getMarginStyle(applySolutionButton)
        }}>
            {applySolutionButton.staticText}
        </Root>
    )
}