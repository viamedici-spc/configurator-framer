import {ControlType, PropertyControls} from "framer";
import {CSSProperties} from "react";
import {BoxProps, createBoxPropertyControls, getBoxStyle} from "./boxProps";
import {createStaticTextPropertyControls, getStaticTextStyle, StaticTextProps} from "./staticTextProps";
import DeepPartial from "./DeepPartial";

export type ButtonProps = BoxProps & StaticTextProps & {
    fillHover: string,
    focusOutline: {
        color: string,
        size: number,
        offset: number
    }
}

export const createButtonPropertyControls = (defaults: DeepPartial<ButtonProps> = {}) => ({
    fillHover: {
        title: "Fill – Hover",
        type: ControlType.Color,
        defaultValue: defaults.fillHover,
    },
    focusOutline: {
        title: "Focus Outline",
        type: ControlType.Object,
        controls: {
            color: {
                title: "Color",
                type: ControlType.Color,
                defaultValue: defaults.focusOutline?.color,
            },
            size: {
                title: "Size",
                type: ControlType.Number,
                defaultValue: defaults.focusOutline?.size,
            },
            offset: {
                title: "Offset",
                type: ControlType.Number,
                defaultValue: defaults.focusOutline?.offset,
            }
        }
    },
    ...createBoxPropertyControls(defaults),
    ...createStaticTextPropertyControls(defaults),
}) satisfies PropertyControls<ButtonProps>;

export const getButtonStyle = (props: ButtonProps): CSSProperties & Record<string, any> => ({
    ...getBoxStyle(props),
    ...getStaticTextStyle(props),
    "--spc-color-button-fill-hover": props.fillHover,
    "--spc-color-button-focus-outline": props.focusOutline.color,
    "--spc-size-button-focus-outline": `${props.focusOutline.size}px`,
    "--spc-size-button-focus-outline-offset": `${props.focusOutline.offset}px`
});