import {ControlType, PropertyControls} from "framer";
import {CSSProperties} from "react";
import {getPaddingStyle, paddingPropertyControls, PaddingProps} from "./paddingProps";
import {borderPropertyControls, BorderProps, getBorderStyle} from "./borderProps";

export type BoxProps = PaddingProps & BorderProps & {
    fill: string
}

export const boxPropertyControls = {
    fill: {
        title: "Fill",
        type: ControlType.Color,
        defaultValue: "#EBEBEB",
    },
    ...paddingPropertyControls,
    ...borderPropertyControls,
} satisfies PropertyControls<BoxProps>;

export const getBoxStyle = (props: BoxProps): CSSProperties => ({
    ...getPaddingStyle(props),
    ...getBorderStyle(props),
    backgroundColor: props.fill
});