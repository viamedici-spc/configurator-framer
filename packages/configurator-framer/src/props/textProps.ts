import {ControlType, PropertyControls} from "framer";
import {CSSProperties} from "react";

export type TextProps = {
    color: string,
    fontSize: number
}

export const textPropertyControls = {
    color: {
        title: "Color",
        type: ControlType.Color,
        defaultValue: "black",
    },
    fontSize: {
        title: "Font size",
        type: ControlType.Number,
        defaultValue: 16,
    }
} satisfies PropertyControls<TextProps>;

export const getTextStyle = (props: TextProps): CSSProperties => ({
    color: props.color,
    fontSize: props.fontSize
});