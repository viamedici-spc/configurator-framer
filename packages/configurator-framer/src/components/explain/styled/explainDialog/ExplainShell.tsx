import {PropsWithChildren} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faXmark} from "@fortawesome/free-solid-svg-icons";
import styled from "styled-components";
import DialogClose from "../../../dialog/DialogClose";
import ExplainHeader from "../common/ExplainHeader";
import ScrollShadow from "./ScrollShadow";
import {motion} from "framer";
import {useExplainDialogProps} from "../../../../props/explain/explainDialogProps";
import {getBoxStyle} from "../../../../props/boxProps";
import {getButtonStyle} from "../../../../props/buttonProps";

const Root = styled(motion.div)`
    position: relative;
    outline-offset: -1px;
    display: grid;
    grid-template-rows: [header] auto [content] auto;
    grid-template-columns: [header content] 1fr;
    align-content: start;
    padding-top: var(--size-explain-dialog-box-padding-top) !important;
    min-height: min(calc(100vh - var(--space-md) * 2), 350px);
    max-height: min(calc(100vh - var(--space-md) * 2), 700px);
    max-width: min(calc(100vw - var(--space-md) * 2), 700px);
    min-width: min(calc(100vw - var(--space-md) * 2), 500px);
`

const Content = styled.div`
    overflow-y: auto;
    grid-area: content;
    padding-left: var(--size-explain-dialog-box-padding-left);
    padding-right: var(--size-explain-dialog-box-padding-right);
    padding-bottom: var(--space-xs-fixed);
`

const StyledScrollShadow = styled(ScrollShadow)`
    margin-left: calc(var(--size-explain-dialog-box-padding-left) * -1);
    margin-right: calc(var(--size-explain-dialog-box-padding-right) * -1);
`

const CloseButton = styled(DialogClose)`
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
    grid-area: header;
    margin-bottom: var(--space-xs);
    overflow: hidden;
    display: flex;
    white-space: nowrap;
    text-overflow: ellipsis;
    margin-right: var(--space-md);
    padding-left: var(--size-explain-dialog-box-padding-left);
    padding-right: var(--size-explain-dialog-box-padding-right);
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
    const {dialogBox, closeButton} = useExplainDialogProps();

    const dialogBoxWithoutPadding = {
        ...dialogBox,
        padding: 0,
        isMixedPadding: false
    } satisfies typeof dialogBox

    return (
        <Root style={getBoxStyle(dialogBoxWithoutPadding)} variants={animationVariants} initial="initial" animate="open" exit="close">
            <StyledExplainHeader/>

            <Content>
                <StyledScrollShadow/>
                {props.children}
            </Content>

            <CloseButton style={getButtonStyle(closeButton)}>
                <FontAwesomeIcon icon={faXmark}/>
            </CloseButton>
        </Root>
    )
}