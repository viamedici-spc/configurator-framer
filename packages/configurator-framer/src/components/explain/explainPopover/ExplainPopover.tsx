import PopoverTrigger from "../../popover/PopoverTrigger";
import Popover, {usePopoverContext} from "../../popover/Popover";
import {Children, PropsWithChildren, ReactNode, useContext, useRef} from "react";
import ExplainContent from "./ExplainContent";
import useExplainProcess from "../../../hooks/useExplainProcess";
import {useControlId} from "../../../common/controlId";
import {FloatingArrow} from "@floating-ui/react";
import PopoverContent from "../../popover/PopoverContent";
import styled from "styled-components";
import {AnimatePresence, motion} from "framer";
import {match} from "ts-pattern";
import FreezeExplainContext from "../common/FreezeExplainContext";
import {ExplainShell} from "./ExplainShell";
import {ExplainPopoverProps, useExplainPopoverProps} from "../../../props/explainPopoverProps";

type Props = {
    content?: ReactNode;
}

const Root = styled(PopoverContent)<ExplainPopoverProps>`
    --color-explain-attribute-value-fill: ${p => p.attributeValueFill};
    --color-explain-attribute-value-add-fill: ${p => p.attributeValueAddFill};
    --color-explain-attribute-value-add-color: ${p => p.attributeValueAddColor};
    --color-explain-attribute-value-remove-fill: ${p => p.attributeValueRemoveFill};
    --color-explain-attribute-value-remove-color: ${p => p.attributeValueRemoveColor};
    --color-explain-header-value-color: ${p => p.headerValueColor};
    --color-explain-popover-fill: ${p => p.fill};
    --color-explain-popover-color: ${p => p.color};
    --color-explain-popover-close-button-outline: ${p => p.closeButtonOutline};
    --color-explain-popover-list-separator: ${p => p.listSeparator};
    --color-explain-popover-apply-solution-button-fill: ${p => p.applySolutionButtonFill};
    --color-explain-popover-apply-solution-button-color: ${p => p.applySolutionButtonColor};
    --color-explain-popover-apply-solution-button-outline: ${p => p.applySolutionButtonOutline};
    --color-explain-popover-show-more-button-outline: ${p => p.showMoreButtonOutline};

    z-index: 10;
    filter: var(--shadows-popover);

    &:focus {
        outline: none;
    }
`

const StyledFloatingArrow = styled(FloatingArrow)`
    fill: var(--color-explain-popover-fill);
`

const animationVariants = {
    initial: {
        opacity: 0,
        scale: 0,
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
        scale: 0,
        transition: {
            duration: 0.2,
            ease: "cubicInOut"
        }
    }
}

export default function ExplainPopover(props: PropsWithChildren<Props>) {
    const explainProcess = useExplainProcess();
    const controlId = useControlId();
    const isOpen = explainProcess?.displayMode === "popover" && explainProcess?.controlId === controlId;
    const arrowRef = useRef<SVGSVGElement>(null);

    return (
        <Popover open={isOpen} onOpenChange={open => !open && isOpen && explainProcess?.dismiss()}
                 arrow={{width: 20, height: 10, padding: 10, element: arrowRef}}>
            <PopoverTrigger>
                {props.children}
            </PopoverTrigger>
            <Animated isOpen={isOpen}>
                {Children.toArray(props.content)[0] ?? (
                    <ExplainShell>
                        <ExplainContent/>
                    </ExplainShell>
                )}
                <Arrow/>
            </Animated>
        </Popover>
    )
}

function Animated(props: PropsWithChildren<{ isOpen: boolean }>) {
    const explainPopoverProps = useExplainPopoverProps();
    const {middlewareData, arrow, placement} = usePopoverContext();
    const arrowX = middlewareData.arrow?.x ?? 0;
    const arrowY = middlewareData.arrow?.y ?? 0;
    const arrowHeight = arrow?.height ?? 0;
    const arrowWidth = arrow?.width ?? 0;
    const transformX = arrowX + arrowWidth / 2;
    const transformY = arrowY + arrowHeight;

    const transformOrigin = match(placement)
        .with("top", () => `${transformX}px calc(100% + ${arrowHeight + 5}px)`)
        .with("bottom", () => `${transformX}px ${-arrowHeight - 5}px`)
        .with("left", () => `calc(100% + ${arrowHeight}px) ${transformY}px`)
        .with("right", () => `${-arrowHeight}px ${transformY}px`)
        .otherwise(() => "")

    return (
        <AnimatePresence initial={false}>
            {props.isOpen && (
                <Root {...explainPopoverProps}>
                    <motion.div variants={animationVariants} initial="initial" animate="open" exit="close"
                                style={{transformOrigin}}>
                        {/*Freeze the explain context otherwise the out-animation won't work correctly.*/}
                        {/*Freezing is ok okay, as the explain process won't update while displayed.*/}
                        <FreezeExplainContext>
                            {props.children}
                        </FreezeExplainContext>
                    </motion.div>
                </Root>
            )}
        </AnimatePresence>
    )
}

function Arrow() {
    const {context, arrow} = usePopoverContext();

    return (
        <StyledFloatingArrow
            ref={arrow.element}
            context={context}
            width={arrow.width}
            height={arrow.height}
        />
    )
}