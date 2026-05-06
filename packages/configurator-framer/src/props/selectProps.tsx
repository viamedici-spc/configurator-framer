import {CSSProperties} from "react";
import {ControlType, PropertyControls} from "framer";
import {match, P} from "ts-pattern";
import {getInputStyle, inputPropertyControls, inputStateColorProperty, InputProps, InputStateColors} from "./inputProps";

export type SelectProps = InputProps & {
    resetLabel: string,
    blockedLabel: string,
    unavailableLabel: string,
    excludeUnavailableOptions: boolean,
    allOptionsBlockedColors: InputStateColors,
    noOptionsAvailableColors: InputStateColors,
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
    unavailableLabel: {
        title: "Unavailable Label",
        type: ControlType.String,
        defaultValue: "Unavailable"
    },
    excludeUnavailableOptions: {
        title: "Exclude Unavailable Options",
        type: ControlType.Boolean,
        defaultValue: true
    },
    allOptionsBlockedColors: {
        ...inputStateColorProperty,
        title: "All Options Blocked Colors"
    },
    noOptionsAvailableColors: {
        ...inputStateColorProperty,
        title: "No Options Available Colors"
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

// Style priority among the "nothing actionable" overrides:
//   noOptionsAvailable (the stricter "all immutable-blocked" case) >
//   allOptionsBlocked (the broader "all blocked" case) >
//   base style (from getInputStyle, which itself layers Unsatisfied >
//   ImplicitSelected > FixedSelected > default).
// `noOptionsAvailable` implies `allOptionsBlocked`. If both colors are set,
// the more specific one wins.
export const getSelectStyle = (
    props: SelectProps,
    isSatisfied: boolean,
    isImplicitSelected: boolean,
    isFixedSelected: boolean = false,
    allOptionsBlocked: boolean = false,
    noOptionsAvailable: boolean = false
): CSSProperties => {
    const baseStyle: CSSProperties = {
        ...getInputStyle(props, isSatisfied, isImplicitSelected, isFixedSelected),
        appearance: props.appearance
    };
    return ({
        ...baseStyle,
        backgroundColor: match({
            allOptionsBlocked,
            noOptionsAvailable,
            allOptionsBlockedFill: props.allOptionsBlockedColors?.fill,
            noOptionsAvailableFill: props.noOptionsAvailableColors?.fill
        })
            .with({noOptionsAvailable: true, noOptionsAvailableFill: P.string.minLength(1)}, p => p.noOptionsAvailableFill)
            .with({allOptionsBlocked: true, allOptionsBlockedFill: P.string.minLength(1)}, p => p.allOptionsBlockedFill)
            .otherwise(() => baseStyle.backgroundColor),
        borderColor: match({
            allOptionsBlocked,
            noOptionsAvailable,
            allOptionsBlockedBorderColor: props.allOptionsBlockedColors?.borderColor,
            noOptionsAvailableBorderColor: props.noOptionsAvailableColors?.borderColor
        })
            .with({noOptionsAvailable: true, noOptionsAvailableBorderColor: P.string.minLength(1)}, p => p.noOptionsAvailableBorderColor)
            .with({allOptionsBlocked: true, allOptionsBlockedBorderColor: P.string.minLength(1)}, p => p.allOptionsBlockedBorderColor)
            .otherwise(() => baseStyle.borderColor),
        color: match({
            allOptionsBlocked,
            noOptionsAvailable,
            allOptionsBlockedColor: props.allOptionsBlockedColors?.color,
            noOptionsAvailableColor: props.noOptionsAvailableColors?.color
        })
            .with({noOptionsAvailable: true, noOptionsAvailableColor: P.string.minLength(1)}, p => p.noOptionsAvailableColor)
            .with({allOptionsBlocked: true, allOptionsBlockedColor: P.string.minLength(1)}, p => p.allOptionsBlockedColor)
            .otherwise(() => baseStyle.color)
    });
};
