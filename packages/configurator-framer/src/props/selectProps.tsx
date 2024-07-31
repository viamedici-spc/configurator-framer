import {CSSProperties} from "react";
import {ControlType, PropertyControls} from "framer";
import {getInputStyle, inputPropertyControls, InputProps} from "./inputProps";

export type SelectProps = InputProps & {
    resetLabel: string,
    blockedLabel: string,
    appearance: "auto" | "none",
    textAlign: "initial" | "start" | "center" | "end"
}

export const selectPropertyControls = {
    ...inputPropertyControls,
    resetLabel: {
        title: "Reset Label",
        type: ControlType.String,
        defaultValue: "Reset"
    },
    blockedLabel: {
        title: "Blocked Label",
        type: ControlType.String,
        defaultValue: "Blocked"
    },
    appearance: {
        title: "Appearance",
        type: ControlType.Enum,
        defaultValue: "auto",
        displaySegmentedControl: true,
        segmentedControlDirection: "horizontal",
        options: ["auto", "none"]
    },
    textAlign: {
        title: "Text Align",
        type: ControlType.Enum,
        defaultValue: "initial",
        options: ["initial", "start", "center", "end"]
    }
} satisfies PropertyControls<SelectProps>

export const getSelectStyle = (props: SelectProps, isSatisfied: boolean, isImplicitSelected: boolean): CSSProperties => ({
    ...getInputStyle(props, isSatisfied, isImplicitSelected),
    appearance: props.appearance,
    textAlign: props.textAlign,
});