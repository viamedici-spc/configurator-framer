import {ControlType, PropertyControls} from "framer";
import {CSSProperties} from "react";
import {getPaddingStyle, createPaddingPropertyControls, PaddingProps} from "./paddingProps";
import {createBorderPropertyControls, BorderProps, getBorderStyle} from "./borderProps";
import DeepPartial from "./DeepPartial";

export type BoxProps = PaddingProps & BorderProps & {
    fill: string,
    backdropFilter: string,
    shadow: string,
    filter: string,
}

export const createBoxPropertyControls = (defaults: DeepPartial<BoxProps> = {}) => ({
    fill: {
        title: "Fill",
        type: ControlType.Color,
        defaultValue: defaults.fill,
    },
    backdropFilter: {
        title: "Backdrop Filter",
        type: ControlType.String,
        defaultValue: defaults.backdropFilter ?? "none"
    },
    shadow: {
        title: "Shadow",
        type: ControlType.String,
        defaultValue: defaults.shadow ?? "none"
    },
    filter: {
        title: "Filter",
        type: ControlType.String,
        defaultValue: defaults.filter ?? "none"
    },
    ...createPaddingPropertyControls(defaults),
    ...createBorderPropertyControls(defaults),
}) satisfies PropertyControls<BoxProps>;

export const getBoxStyle = (props: BoxProps): CSSProperties => ({
    ...getPaddingStyle(props),
    ...getBorderStyle(props),
    backgroundColor: props.fill,
    backdropFilter: props.backdropFilter,
    boxShadow: props.shadow,
    filter: props.filter
});