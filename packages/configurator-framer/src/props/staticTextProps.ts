import type {PropertyControls} from "framer";
import {ControlType} from "framer";
import type {CSSProperties} from "react";
import type {TextProps} from "./textProps";
import {createTextPropertyControls, getTextStyle} from "./textProps";

export type StaticTextProps = TextProps & {
    staticText: string;
};

export const createStaticTextPropertyControls = (defaults: Partial<StaticTextProps> = {}) =>
    ({
        staticText: {
            title: "Text",
            type: ControlType.String,
            defaultValue: defaults.staticText,
        },
        ...createTextPropertyControls(defaults),
    }) satisfies PropertyControls<StaticTextProps>;

export const getStaticTextStyle = (props: StaticTextProps): CSSProperties => getTextStyle(props);