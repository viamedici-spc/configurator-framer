import {ControlType, PropertyControls} from "framer";
import {CSSProperties} from "react";

export type PaddingProps = {
    padding: number
    paddingTop: number
    paddingRight: number
    paddingBottom: number
    paddingLeft: number
    isMixedPadding: boolean
}

export const paddingPropertyControls = {
    padding: {
        type: ControlType.FusedNumber,
        title: "Padding",
        toggleKey: "isMixedPadding",
        toggleTitles: ["Padding", "Padding per Side"],
        valueKeys: [
            "paddingTop",
            "paddingRight",
            "paddingBottom",
            "paddingLeft",
        ],
        valueLabels: ["Top", "Right", "Bottom", "Left"],
        min: 0,
        defaultValue: 0,
    }
} satisfies PropertyControls<PaddingProps>;

export const getPaddingStyle = (props: PaddingProps): CSSProperties => ({
    paddingTop: props.isMixedPadding ? props.paddingTop : props.padding,
    paddingRight: props.isMixedPadding ? props.paddingRight : props.padding,
    paddingBottom: props.isMixedPadding ? props.paddingBottom : props.padding,
    paddingLeft: props.isMixedPadding ? props.paddingLeft : props.padding
});