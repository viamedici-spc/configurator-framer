import {addPropertyControls, ControlType, PropertyControls} from "framer";
import {ButtonHTMLAttributes, forwardRef} from "react";
import {usePopoverContext} from "./Popover";
import useRenderPlaceholder from "../../hooks/useRenderPlaceholder";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
    appearance?: "auto" | "none"
};

/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 */
const PopoverClose = forwardRef<HTMLButtonElement, Props>((props, ref) => {
    const renderPlaceholder = useRenderPlaceholder();
    const {appearance, style, children, ...restProps} = props;
    const resetStyle = appearance === "none" ? {
        border: "none",
        background: "transparent",
        padding: 0,
        outline: "none"
    } : {};
    const mergedStyle = {...style, ...(appearance ? {appearance} : {}), ...resetStyle};

    if (renderPlaceholder) {
        return (
            <button type="button" ref={ref} {...restProps} style={mergedStyle}>
                {children}
            </button>
        );
    }

    const {setOpen} = usePopoverContext();
    return (
        <button
            type="button"
            ref={ref}
            {...restProps}
            style={mergedStyle}
            onClick={(event) => {
                props.onClick?.(event);
                setOpen(false);
            }}
        >
            {children}
        </button>
    );
});

export default PopoverClose;

const propertyControls: PropertyControls<Props> = {
    children: {
        title: "Content",
        type: ControlType.ComponentInstance
    },
    appearance: {
        title: "Appearance",
        type: ControlType.Enum,
        defaultValue: "auto",
        displaySegmentedControl: true,
        segmentedControlDirection: "horizontal",
        options: ["auto", "none"]
    }
};

addPropertyControls(PopoverClose, propertyControls);
