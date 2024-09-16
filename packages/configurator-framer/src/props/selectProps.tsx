import {CSSProperties} from "react";
import {ControlType, PropertyControls} from "framer";
import {getInputStyle, inputPropertyControls, InputProps} from "./inputProps";

export type SelectProps = InputProps & {
    resetLabel: string,
    blockedLabel: string,
    appearance: "auto" | "none"
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
    }
} satisfies PropertyControls<SelectProps>

export const getSelectStyle = (props: SelectProps, isSatisfied: boolean, isImplicitSelected: boolean): CSSProperties => ({
    ...getInputStyle(props, isSatisfied, isImplicitSelected),
    appearance: props.appearance
});