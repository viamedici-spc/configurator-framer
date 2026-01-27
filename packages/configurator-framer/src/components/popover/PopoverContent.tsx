import {forwardRef, HTMLProps} from "react";
import {FloatingFocusManager, FloatingPortal, useMergeRefs} from "@floating-ui/react";
import {usePopoverContext} from "./Popover";

const PopoverContent = forwardRef<HTMLDivElement, HTMLProps<HTMLDivElement>>((props, ref) => {
    const {style, children, ...restProps} = props;
    const popoverContext = usePopoverContext();
    const rootRef = useMergeRefs([popoverContext.refs.setFloating, ref]);

    const portalRoot = getFramerRoot();

    return (
        <FloatingPortal root={portalRoot}>
            <FloatingFocusManager context={popoverContext.context} modal={popoverContext.modal}>
                <div
                    ref={rootRef}
                    style={{...popoverContext.floatingStyles, ...style}}
                    {...popoverContext.getFloatingProps(restProps)}>
                    {children}
                </div>
            </FloatingFocusManager>
        </FloatingPortal>
    );
});

export default PopoverContent;

function getFramerRoot(): HTMLElement | null {
    if (typeof document === "undefined") {
        return null;
    }

    return document.querySelector<HTMLElement>("[data-framer-root]");
}
