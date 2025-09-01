import {ControlType, PropertyControls} from "framer";
import {CSSProperties} from "react";

export type MarginProps = {
    margin: number
    marginTop: number
    marginRight: number
    marginBottom: number
    marginLeft: number
    isMixedMargin: boolean
}

export const createMarginPropertyControls = (defaults: Partial<MarginProps> = {}) => ({
    margin: {
        type: ControlType.FusedNumber,
        title: "Margin",
        toggleKey: "isMixedMargin",
        toggleTitles: ["Margin", "Margin per Side"],
        valueKeys: [
            "marginTop",
            "marginRight",
            "marginBottom",
            "marginLeft",
        ],
        valueLabels: ["Top", "Right", "Bottom", "Left"],
        defaultValue: defaults.margin ?? 0,
    }
}) satisfies PropertyControls<MarginProps>;

export const getMarginStyle = (props: MarginProps): CSSProperties => ({
    marginTop: props.isMixedMargin ? props.marginTop : props.margin,
    marginRight: props.isMixedMargin ? props.marginRight : props.margin,
    marginBottom: props.isMixedMargin ? props.marginBottom : props.margin,
    marginLeft: props.isMixedMargin ? props.marginLeft : props.margin
});