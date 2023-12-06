import {Children, cloneElement, forwardRef, isValidElement, PropsWithChildren} from "react";
import {useMergeRefs} from "@floating-ui/react";
import {usePopoverContext} from "./Popover";

const PopoverTrigger = forwardRef<Element, PropsWithChildren>(function PopoverTrigger(props, propRef) {
    const children = Children.toArray(props.children)[0];
    const context = usePopoverContext();
    const childrenRef = (props.children as any).ref;
    const ref = useMergeRefs([context.refs.setReference, propRef, childrenRef]);

    if (isValidElement(children)) {
        return cloneElement(
            children,
            context.getReferenceProps({
                ref,
                ...props,
                ...children.props,
                "data-state": context.open ? "open" : "closed"
            })
        );
    }

    return <span>Not valid children for PopoverTrigger</span>
});

export default PopoverTrigger;