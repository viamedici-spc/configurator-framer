import {ControlType, PropertyControls} from "framer";
import {CSSProperties} from "react";
import {createTextPropertyControls, getTextStyle, TextProps} from "./textProps";

export type StaticTextProps = TextProps & {
    staticText: string
}

export const createStaticTextPropertyControls = (defaults: Partial<StaticTextProps> = {}) => ({
    staticText: {
        title: "Text",
        type: ControlType.String,
        defaultValue: defaults.staticText,
    },
    ...createTextPropertyControls(defaults)
}) satisfies PropertyControls<StaticTextProps>;

export const getStaticTextStyle = (props: StaticTextProps): CSSProperties => getTextStyle(props);