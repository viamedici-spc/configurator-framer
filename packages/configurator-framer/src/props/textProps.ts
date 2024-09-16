import {ControlType, PropertyControls} from "framer";
import {CSSProperties} from "react";

export type TextProps = {
    color: string,
    text: {
        fontFamily: string,
        fontSize: string,
        fontStyle: string,
        fontWeight: string
    }
}

export const textPropertyControls = {
    color: {
        title: "Color",
        type: ControlType.Color,
        defaultValue: "black",
    },
    text: {
        title: "Text",
        type: ControlType.Font,
        controls: "basic",
        displayTextAlignment: true,
        displayFontSize: true
    }
} satisfies PropertyControls<TextProps>;

export const getTextStyle = (props: TextProps): CSSProperties => ({
    ...props.text,
    color: props.color
});