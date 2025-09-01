import {ControlType, PropertyControls} from "framer";
import {CSSProperties} from "react";

export type TextProps = {
    color: string,
    text: {
        fontFamily?: string,
        fontSize?: number,
        fontStyle?: string,
        fontWeight?: string,
        textAlign?: "left" | "right" | "center";
        letterSpacing?: string | number;
        lineHeight?: string | number;
    }
}

export const createTextPropertyControls = (defaults: Partial<TextProps> = {}) => ({
    color: {
        title: "Color",
        type: ControlType.Color,
        defaultValue: defaults.color ?? "black",
    },
    text: {
        title: "Text",
        type: ControlType.Font,
        controls: "basic",
        displayTextAlignment: true,
        displayFontSize: true,
        defaultValue: {
            fontSize: defaults.text?.fontSize,
            textAlign: defaults.text?.textAlign,
        },
    }
}) satisfies PropertyControls<TextProps>;

export const getTextStyle = (props: TextProps): CSSProperties => ({
    ...props.text,
    color: props.color
});