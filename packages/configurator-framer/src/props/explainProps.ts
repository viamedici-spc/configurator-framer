import {ControlType, PropertyControls} from "framer";
import {DisplayMode} from "../common/explain";

export type ExplainProps = {
    explain: DisplayMode | "disabled"
}

export const explainPropertyControls = {
    explain: {
        title: "Explain",
        type: ControlType.Enum,
        defaultValue: "popover",
        options: ["popover", "dialog", "disabled"],
    }
} satisfies PropertyControls<ExplainProps>;
