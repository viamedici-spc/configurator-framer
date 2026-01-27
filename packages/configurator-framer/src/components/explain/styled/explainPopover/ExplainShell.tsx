import {PropsWithChildren} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faXmark} from "@fortawesome/free-solid-svg-icons";
import styled from "styled-components";
import PopoverClose from "../../../popover/PopoverClose";
import ExplainHeader from "../common/ExplainHeader";
import {getBoxStyle} from "../../../../props/boxProps";
import {ExplainPopoverProps, useExplainPopoverProps} from "../../../../props/explain/explainPopoverProps";
import {getButtonStyle} from "../../../../props/buttonProps";

const Root = styled.div<ExplainPopoverProps>`
    --size-explain-popover-box-padding-top: ${p => p.popoverBox.isMixedPadding ? p.popoverBox.paddingTop : p.popoverBox.padding}px;
    --size-explain-popover-box-padding-right: ${p => p.popoverBox.isMixedPadding ? p.popoverBox.paddingRight : p.popoverBox.padding}px;
    --size-explain-popover-box-padding-bottom: ${p => p.popoverBox.isMixedPadding ? p.popoverBox.paddingBottom : p.popoverBox.padding}px;
    --size-explain-popover-box-padding-left: ${p => p.popoverBox.isMixedPadding ? p.popoverBox.paddingLeft : p.popoverBox.padding}px;
    --color-explain-popover-list-separator: ${p => p.listSeparator};

    position: relative;
    outline-offset: -1px;
    border-style: solid;
    min-width: 300px;
    max-width: 500px;
`

const CloseButton = styled(PopoverClose)`
    position: absolute;
    right: var(--space-sm-fixed);
    top: var(--space-sm-fixed);
    cursor: pointer;

    &:hover {
        background-color: var(--color-button-fill-hover) !important;
    }

    &:focus {
        outline: var(--size-button-focus-outline) solid var(--color-button-focus-outline);
        outline-offset: var(--size-button-focus-outline-offset);
    }
`

const StyledExplainHeader = styled(ExplainHeader)`
    margin-bottom: var(--space-xs);
    overflow: hidden;
    display: flex;
    white-space: nowrap;
    text-overflow: ellipsis;
    margin-right: var(--space-md);
`

export function ExplainShell(props: PropsWithChildren) {
    const explainPopoverProps = useExplainPopoverProps();
    const {popoverBox, closeButton} = explainPopoverProps;

    return (
        <Root {...explainPopoverProps} style={getBoxStyle(popoverBox)}>
            <StyledExplainHeader/>

            {props.children}

            <CloseButton style={getButtonStyle(closeButton)}>
                <FontAwesomeIcon icon={faXmark}/>
            </CloseButton>
        </Root>
    )
}