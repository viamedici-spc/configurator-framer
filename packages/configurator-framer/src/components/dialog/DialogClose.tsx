import {useDialogContext} from "./Dialog";
import {ButtonHTMLAttributes, forwardRef} from "react";

const DialogClose = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement>>((props, ref) => {
    const {setOpen} = useDialogContext();
    return (
        <button type="button"
                ref={ref}
                {...props}
                onClick={(event) => {
                    props.onClick?.(event);
                    setOpen(false);
                }}/>
    );
});

export default DialogClose;