import {FloatingFocusManager, FloatingOverlay, FloatingPortal, useMergeRefs} from "@floating-ui/react";
import {useDialogContext} from "./Dialog";
import {ComponentProps, ComponentType, forwardRef, HTMLProps} from "react";
import styled, {css} from "styled-components";

export const defaultOverlayStyle = css`
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 100;
    padding: var(--space-md-fixed);
`

const DefaultOverlay = styled(FloatingOverlay)`
    ${defaultOverlayStyle};
`

type Props = HTMLProps<HTMLDivElement> & {
    components?: {
        Overlay?: ComponentType<ComponentProps<typeof FloatingOverlay>>
    }
}

const DialogContent = forwardRef<HTMLDivElement, Props>((props, ref) => {
    const {style, children, components, ...restProps} = props;
    const dialogContext = useDialogContext();
    const rootRef = useMergeRefs([dialogContext.refs.setFloating, ref]);

    const Overlay = components?.Overlay ?? DefaultOverlay;

    return (
        <FloatingPortal>
            <Overlay lockScroll>
                <FloatingFocusManager context={dialogContext.context}>
                    <div ref={rootRef}
                         {...dialogContext.getFloatingProps(restProps)}>
                        {children}
                    </div>
                </FloatingFocusManager>
            </Overlay>
        </FloatingPortal>
    );
});

export default DialogContent;