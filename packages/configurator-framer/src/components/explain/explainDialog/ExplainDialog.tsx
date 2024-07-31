import {Children, ComponentPropsWithoutRef, PropsWithChildren, ReactNode} from "react";
import ExplainContent from "./ExplainContent";
import useExplainProcess from "../../../hooks/useExplainProcess";
import styled from "styled-components";
import {AnimatePresence, motion} from "framer";
import Dialog from "../../dialog/Dialog";
import DialogContent, {defaultOverlayStyle} from "../../dialog/DialogContent";
import FreezeExplainContext from "../common/FreezeExplainContext";
import {ExplainShell} from "./ExplainShell";
import {ExplainDialogProps, explainDialogPropsContext} from "../../../props/explainDialogProps";
import {FloatingOverlay} from "@floating-ui/react";

type Props = ExplainDialogProps & {
    content?: ReactNode;
}

const Root = styled(DialogContent)<ExplainDialogProps>`
    --color-explain-attribute-value-fill: ${p => p.attributeValueFill};
    --color-explain-attribute-value-add-fill: ${p => p.attributeValueAddFill};
    --color-explain-attribute-value-add-color: ${p => p.attributeValueAddColor};
    --color-explain-attribute-value-remove-fill: ${p => p.attributeValueRemoveFill};
    --color-explain-attribute-value-remove-color: ${p => p.attributeValueRemoveColor};
    --color-explain-header-value-color: ${p => p.headerValueColor};
    --color-explain-dialog-fill: ${p => p.fill};
    --color-explain-dialog-color: ${p => p.color};
    --color-explain-dialog-close-button-outline: ${p => p.closeButtonOutline};
    --color-explain-dialog-apply-solution-button-fill: ${p => p.applySolutionButtonFill};
    --color-explain-dialog-apply-solution-button-color: ${p => p.applySolutionButtonColor};
    --color-explain-dialog-apply-solution-button-outline: ${p => p.applySolutionButtonOutline};
    --color-explain-dialog-explanation-card: ${p => p.explanationCard};
    --color-explain-dialog-scroll-shadow-border: ${p => p.scrollShadowBorder};
    --backdrop-filter-explain-dialog: ${p => p.backdropFilter};

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