import PopoverTrigger from "../popover/PopoverTrigger";
import Popover, {usePopoverContext} from "../popover/Popover";
import {PropsWithChildren, useRef} from "react";
import ExplainContent from "./styled/explainPopover/ExplainContent";
import useExplainProcess from "../../hooks/useExplainProcess";
import {useControlId} from "../../common/controlId";
import {FloatingArrow} from "@floating-ui/react";
import PopoverContent from "../popover/PopoverContent";
import styled from "styled-components";
import {AnimatePresence, motion} from "framer";
import {match} from "ts-pattern";
import FreezeExplainContext from "./styled/common/FreezeExplainContext";
import {ExplainShell} from "./styled/explainPopover/ExplainShell";
import {getArrowStyle, useExplainPopoverProps} from "../../props/explain/explainPopoverProps";

const StyledPopoverContent = styled(PopoverContent)`
    z-index: 10;

    &:focus {
        outline: none;
    }
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

export default function ExplainPopover(props: PropsWithChildren) {
    const explainProcess = useExplainProcess();
    const explainPopoverProps = useExplainPopoverProps();
    const {useCustomExplain, customPopover} = explainPopoverProps;
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
                {useCustomExplain && customPopover}
                {!useCustomExplain && (
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
                <StyledPopoverContent>
                    <motion.div variants={animationVariants} initial="initial" animate="open" exit="close"
                                style={{transformOrigin}}>
                        {/*Freeze the explain context otherwise the out-animation won't work correctly.*/}
                        {/*Freezing is ok okay, as the explain process won't update while displayed.*/}
                        <FreezeExplainContext>
                            {props.children}
                        </FreezeExplainContext>
                    </motion.div>
                </StyledPopoverContent>
            )}
        </AnimatePresence>
    )
}

function Arrow() {
    const {context, arrow} = usePopoverContext();
    const explainPopoverProps = useExplainPopoverProps();

    return (
        <FloatingArrow style={getArrowStyle(explainPopoverProps)}
                       ref={arrow.element}
                       context={context}
                       width={arrow.width}
                       height={arrow.height}
        />
    )
}