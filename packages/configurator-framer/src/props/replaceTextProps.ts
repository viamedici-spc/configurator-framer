import {ControlType, PropertyControls} from "framer";
import {ReactNode} from "react";

export type ReplaceTextProps = {
    children: ReactNode,
    mode: "replace" | "set-prop",
    replaceString: string,
    elementName: string,
    propName: string,
}

export const replaceTextPropertyControls = (replaceStringDefault: string) => ({
    children: {
        title: "Content",
        type: ControlType.ComponentInstance,
    },
    mode: {
        title: "Mode",
        type: ControlType.Enum,
        defaultValue: "replace",
        options: ["replace", "set-prop"],
        displaySegmentedControl: true
    },
    replaceString: {
        title: "Replace Text",
        type: ControlType.String,
        defaultValue: replaceStringDefault,
        hidden: p => p.mode !== "replace"
    },
    elementName: {
        title: "Element Name",
        type: ControlType.String,
        hidden: p => p.mode !== "set-prop"
    },
    propName: {
        title: "Property Name",
        type: ControlType.String,
        hidden: p => p.mode !== "set-prop"
    }
}) satisfies PropertyControls<ReplaceTextProps>;
