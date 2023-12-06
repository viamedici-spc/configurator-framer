import {useMergeRefs} from "@floating-ui/react";
import {useDialogContext} from "./Dialog";
import {Children, cloneElement, forwardRef, isValidElement, PropsWithChildren} from "react";

const DialogTrigger = forwardRef<Element, PropsWithChildren>(function DialogTrigger(props, propRef) {
    const children = Children.toArray(props.children)[0];
    const context = useDialogContext();
    const childrenRef = (children as any).ref;
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

    return <span>Not valid children for DialogTrigger</span>
});

export default DialogTrigger;