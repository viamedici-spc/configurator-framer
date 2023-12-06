import * as React from "react";
import {useClick, useDismiss, useFloating, useInteractions, useRole} from "@floating-ui/react";

export interface DialogOptions {
    initialOpen?: boolean;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export default function useDialog(options: DialogOptions = {}) {
    const {
        initialOpen = false,
        open: controlledOpen,
        onOpenChange: setControlledOpen
    } = options;
    const [uncontrolledOpen, setUncontrolledOpen] = React.useState(initialOpen);

    const open = controlledOpen ?? uncontrolledOpen;
    const setOpen = setControlledOpen ?? setUncontrolledOpen;

    const data = useFloating({
        open,
        onOpenChange: setOpen
    });

    const context = data.context;

    const click = useClick(context, {
        enabled: controlledOpen == null
    });
    const dismiss = useDismiss(context, {outsidePressEvent: "mousedown"});

    const interactions = useInteractions([click, dismiss]);

    return React.useMemo(() => ({open, setOpen, ...interactions, ...data}),
        [open, setOpen, interactions, data]
    );
}