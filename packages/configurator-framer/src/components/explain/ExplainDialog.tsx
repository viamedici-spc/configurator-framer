import {Children, ComponentPropsWithoutRef, PropsWithChildren, ReactNode} from "react";
import ExplainContent from "./styled/explainDialog/ExplainContent";
import useExplainProcess from "../../hooks/useExplainProcess";
import styled from "styled-components";
import {AnimatePresence, motion} from "framer";
import Dialog from "../dialog/Dialog";
import DialogContent, {defaultOverlayStyle} from "../dialog/DialogContent";
import FreezeExplainContext from "./styled/common/FreezeExplainContext";
import {ExplainShell} from "./styled/explainDialog/ExplainShell";
import {ExplainDialogProps, explainDialogPropsContext} from "../../props/explain/explainDialogProps";
import {FloatingOverlay} from "@floating-ui/react";

type Props = ExplainDialogProps & {
    content?: ReactNode;
}

const Root = styled(DialogContent)<ExplainDialogProps>`
    --size-explain-dialog-box-padding-top: ${p => p.dialogBox.isMixedPadding ? p.dialogBox.paddingTop : p.dialogBox.padding}px;
    --size-explain-dialog-box-padding-right: ${p => p.dialogBox.isMixedPadding ? p.dialogBox.paddingRight : p.dialogBox.padding}px;
    --size-explain-dialog-box-padding-bottom: ${p => p.dialogBox.isMixedPadding ? p.dialogBox.paddingBottom : p.dialogBox.padding}px;
    --size-explain-dialog-box-padding-left: ${p => p.dialogBox.isMixedPadding ? p.dialogBox.paddingLeft : p.dialogBox.padding}px;
    --color-explain-dialog-scroll-shadow-border: ${p => p.scrollShadowBorder};

    display: grid;

    &:focus {
        outline: none;
    }
`

export default function ExplainDialog(props: Props) {
    const explainProcess = useExplainProcess();
    const isOpen = explainProcess?.displayMode === "dialog";

    return (
        <Dialog open={isOpen} onOpenChange={open => !open && isOpen && explainProcess?.dismiss()}>
            <Animated {...props} isOpen={isOpen}>
                {Children.toArray(props.content)[0] ?? (
                    <ExplainShell>
                        <ExplainContent/>
                    </ExplainShell>
                )}
            </Animated>
        </Dialog>
    )
}

function Animated(props: PropsWithChildren<ExplainDialogProps & { isOpen: boolean }>) {
    return (
        <AnimatePresence initial={false}>
            {props.isOpen && (
                <explainDialogPropsContext.Provider value={props}>
                    <Root {...props} components={{Overlay}}>
                        {/*Freeze the explain context otherwise the out-animation won't work correctly.*/}
                        {/*Freezing is ok okay, as the explain process won't update while displayed.*/}
                        <FreezeExplainContext>
                            {props.children}
                        </FreezeExplainContext>
                    </Root>
                </explainDialogPropsContext.Provider>
            )}
        </AnimatePresence>
    )
}

const MotionOverlay = styled(motion(FloatingOverlay))`
    ${defaultOverlayStyle}
`

function Overlay(props: ComponentPropsWithoutRef<typeof MotionOverlay>) {
    return (
        <MotionOverlay {...props}
                       initial={{backgroundColor: "rgba(0,0,0,0)"}}
                       animate={{backgroundColor: "rgba(0,0,0,0.1)"}}
                       exit={{backgroundColor: "rgba(0,0,0,0)"}}
        />
    )
}