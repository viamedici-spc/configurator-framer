import {PropsWithChildren} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faXmark} from "@fortawesome/free-solid-svg-icons";
import styled from "styled-components";
import DialogClose from "../../dialog/DialogClose";
import ExplainHeader from "../common/ExplainHeader";
import ScrollShadow from "./ScrollShadow";
import {motion} from "framer";

const Root = styled(motion.div)`
    position: relative;
    background-color: var(--color-explain-dialog-fill);
    backdrop-filter: var(--backdrop-filter-explain-dialog);
    color: var(--color-explain-dialog-color);
    outline-offset: -1px;
    padding-top: 1.1em;
    border-radius: var(--shape-border-radius-md);
    box-shadow: var(--shadows-dialog);
    font-size: var(--text-base-size);
    font-family: var(--font-primary);
    display: grid;
    grid-template-rows: [header] auto [content] auto;
    grid-template-columns: [header content] 1fr;
    align-content: start;
    min-height: min(calc(100vh - var(--space-md) * 2), 350px);
    max-height: min(calc(100vh - var(--space-md) * 2), 700px);
    max-width: min(calc(100vw - var(--space-md) * 2), 700px);
    min-width: min(calc(100vw - var(--space-md) * 2), 500px);
`

const Content = styled.div`
    overflow-y: auto;
    grid-area: content;
    padding-left: var(--space-xs-fixed);
    padding-right: var(--space-xs-fixed);
    padding-bottom: var(--space-xs-fixed);
`

const StyledScrollShadow = styled(ScrollShadow)`
    margin-left: calc(var(--space-xs-fixed) * -1);
    margin-right: calc(var(--space-xs-fixed) * -1);
`

const CloseButton = styled(DialogClose)`
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
        outline: 2px solid var(--color-explain-dialog-close-button-outline);
        outline-offset: 1px;
    }
`

const StyledExplainHeader = styled(ExplainHeader)`
    grid-area: header;
    font-size: var(--text-md);
    font-weight: 500;
    font-family: var(--font-heading);
    margin-bottom: var(--space-xs);
    overflow: hidden;
    display: flex;
    white-space: nowrap;
    text-overflow: ellipsis;
    margin-right: var(--space-md);
    margin-left: calc(var(--space-xs-fixed) + var(--space-sm-fixed));
`

const animationVariants = {
    initial: {
        opacity: 0,
        scale: 0.5,
    },
    open: {
        opacity: 1,
        scale: 1,
        transition: {
            type: "spring",
            stiffness: 600,
            damping: 40
        }
    },
    close: {
        opacity: 0,
        scale: 0.7,
        transition: {
            duration: 0.1,
            ease: "cubicInOut"
        }
    }
}

export function ExplainShell(props: PropsWithChildren) {
    return (
        <Root variants={animationVariants} initial="initial" animate="open" exit="close">
            <StyledExplainHeader/>

            <Content>
                <StyledScrollShadow/>
                {props.children}
            </Content>

            <CloseButton>
                <FontAwesomeIcon icon={faXmark}/>
            </CloseButton>
        </Root>
    )
}