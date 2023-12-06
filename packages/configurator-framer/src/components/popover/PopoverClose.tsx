import {ButtonHTMLAttributes, forwardRef} from "react";
import {usePopoverContext} from "./Popover";

const PopoverClose = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement>>((props, ref) => {
    const {setOpen} = usePopoverContext();
    return (
        <button
            type="button"
            ref={ref}
            {...props}
            onClick={(event) => {
                props.onClick?.(event);
                setOpen(false);
            }}
        />
    );
});

export default PopoverClose;