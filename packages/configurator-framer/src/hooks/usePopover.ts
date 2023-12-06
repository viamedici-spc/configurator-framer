import {autoUpdate, flip, offset, Placement, shift, arrow as arrowMiddleware, useClick, useDismiss, useFloating, useInteractions, Middleware} from "@floating-ui/react";
import {RefObject, useMemo, useState} from "react";

export interface PopoverOptions {
    initialOpen?: boolean;
    placement?: Placement;
    modal?: boolean;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    arrow?: { width: number, height: number, padding: number, element: RefObject<SVGSVGElement> };
}

export default function usePopover(options: PopoverOptions = {}) {
    const {
        initialOpen = false,
        placement = "top",
        modal = false,
        open: controlledOpen,
        onOpenChange: setControlledOpen,
        arrow
    } = options;
    const [uncontrolledOpen, setUncontrolledOpen] = useState(initialOpen);

    const open = controlledOpen ?? uncontrolledOpen;
    const setOpen = setControlledOpen ?? setUncontrolledOpen;

    const data = useFloating({
        placement,
        open,
        onOpenChange: setOpen,
        whileElementsMounted: autoUpdate,
        middleware: [
            offset((arrow?.height ?? 0) + 5),
            flip({
                crossAxis: placement.includes("-"),
                fallbackAxisSideDirection: "end",
                padding: 5
            }),
            shift({padding: 5}),
            ...(arrow ? [arrowMiddleware(arrow)] : [])
        ]
    });

    const context = data.context;

    const click = useClick(context, {
        enabled: controlledOpen == null
    });
    const dismiss = useDismiss(context);

    const interactions = useInteractions([click, dismiss]);

    return useMemo(() => ({open, setOpen, ...interactions, ...data, modal, arrow}),
        [open, setOpen, interactions, data, modal, arrow]
    );
}