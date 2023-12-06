import {ControlType, PropertyControls} from "framer";
import {CSSProperties} from "react";
import {paddingPropertyControls} from "./paddingProps";

export type BorderProps = {
    radius: number
    border: {
        color: string
        width: number
        isMixedWidth: boolean
        widthTop: number
        widthRight: number
        widthBottom: number
        widthLeft: number
    }
}

export const borderPropertyControls = {
    radius: {
        title: "Radius",
        type: ControlType.Number,
        defaultValue: 6,
    },
    ...paddingPropertyControls,
    border: {
        title: "Border",
        type: ControlType.Object,
        controls: {
            color: {
                type: ControlType.Color,
                title: "Color",
            },
            width: {
                type: ControlType.FusedNumber,
                title: "Width",
                toggleKey: "isMixedWidth",
                toggleTitles: ["Width", "Width per Side"],
                valueKeys: [
                    "widthTop",
                    "widthRight",
                    "widthBottom",
                    "widthLeft",
                ],
                valueLabels: ["Top", "Right", "Bottom", "Left"],
                min: 0,
                defaultValue: 0,
            },
        },
    },

} satisfies PropertyControls<BorderProps>;

export const getBorderStyle = (props: BorderProps): CSSProperties => ({
    borderRadius: props.radius,
    borderColor: props.border?.color,
    borderTopWidth: props.border?.isMixedWidth ? props.border?.widthTop : props.border?.width,
    borderRightWidth: props.border?.isMixedWidth ? props.border?.widthRight : props.border?.width,
    borderBottomWidth: props.border?.isMixedWidth ? props.border?.widthBottom : props.border?.width,
    borderLeftWidth: props.border?.isMixedWidth ? props.border?.widthLeft : props.border?.width
});