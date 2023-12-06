import {PropsWithChildren} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faXmark} from "@fortawesome/free-solid-svg-icons";
import styled from "styled-components";
import PopoverClose from "../../popover/PopoverClose";
import ExplainHeader from "../common/ExplainHeader";

const Root = styled.div`
    position: relative;
    background-color: var(--color-explain-popover-fill);
    color: var(--color-explain-popover-color);
    outline-offset: -1px;
    padding: 1.1em;
    border-radius: var(--shape-border-radius-md);
    font-size: var(--text-base-size);
    font-family: var(--font-primary);
    min-width: 300px;
    max-width: 500px;
`

const CloseButton = styled(PopoverClose)`
    position: absolute;
    right: var(--space-sm-fixed);
    top: var(--space-sm-fixed);
    border: none;
    background-color: transparent;
    color: inherit;
    font-size: var(--text-sm);
    cursor: pointer;
    border-radius: var(--shape-border-radius-xs);

    &:focus {
        outline: 2px solid var(--color-explain-popover-close-button-outline);
        outline-offset: 1px;
    }
`

const StyledExplainHeader = styled(ExplainHeader)`
    font-size: var(--text-md);
    font-weight: 500;
    font-family: var(--font-heading);
    margin-bottom: var(--space-xs);
    overflow: hidden;
    display: flex;
    white-space: nowrap;
    text-overflow: ellipsis;
    margin-right: var(--space-md);
`

export function ExplainShell(props: PropsWithChildren) {
    return (
        <Root>
            <StyledExplainHeader/>

            {props.children}

            <CloseButton>
                <FontAwesomeIcon icon={faXmark}/>
            </CloseButton>
        </Root>
    )
}