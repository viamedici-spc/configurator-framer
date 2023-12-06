import {ControlType, PropertyControls} from "framer";
import {createContext} from "react";

export type ExplainPopoverProps = {
    attributeValueFill: string;
    attributeValueAddFill: string;
    attributeValueAddColor: string;
    attributeValueRemoveFill: string;
    attributeValueRemoveColor: string;
    headerValueColor: string;
    fill: string;
    color: string;
    closeButtonOutline: string;
    listSeparator: string;
    applySolutionButtonFill: string;
    applySolutionButtonColor: string;
    applySolutionButtonOutline: string;
    showMoreButtonOutline: string;
}

export const explainPopoverPropertyControls = {
    fill: {
        title: "Fill",
        type: ControlType.Color,
        defaultValue: "#002134"
    },
    color: {
        title: "Color",
        type: ControlType.Color,
        defaultValue: "white"
    },
    attributeValueFill: {
        title: "Attribute Value Fill",
        type: ControlType.Color,
        defaultValue: "rgba(255, 255, 255, 0.2)"
    },
    attributeValueAddFill: {
        title: "Attribute Value Add Fill",
        type: ControlType.Color,
        defaultValue: "rgba(47, 255, 0, 0.2)"
    },
    attributeValueAddColor: {
        title: "Attribute Value Add Color",
        type: ControlType.Color,
        defaultValue: "#63e446"
    },
    attributeValueRemoveFill: {
        title: "Attribute Value Remove Fill",
        type: ControlType.Color,
        defaultValue: "#ff00004a"
    },
    attributeValueRemoveColor: {
        title: "Attribute Value Remove Color",
        type: ControlType.Color,
        defaultValue: "#ff6060"
    },
    headerValueColor: {
        title: "Header Value Color",
        type: ControlType.Color,
        defaultValue: "rgb(0, 161, 230)"
    },
    closeButtonOutline: {
        title: "Close Button Outline",
        type: ControlType.Color,
        defaultValue: "rgba(255, 255, 255, 0.8)"
    },
    listSeparator: {
        title: "List Separator",
        type: ControlType.Color,
        defaultValue: "rgba(255, 255, 255, 0.3)"
    },
    applySolutionButtonFill: {
        title: "Apply Solution Button Fill",
        type: ControlType.Color,
        defaultValue: "rgb(0, 161, 230)"
    },
    applySolutionButtonColor: {
        title: "Apply Solution Button Color",
        type: ControlType.Color,
        defaultValue: "white"
    },
    applySolutionButtonOutline: {
        title: "Apply Solution Button Outline",
        type: ControlType.Color,
        defaultValue: "rgba(255, 255, 255, 0.8)"
    },
    showMoreButtonOutline: {
        title: "Show More Button Outline",
        type: ControlType.Color,
        defaultValue: "rgba(255, 255, 255, 0.8)"
    }
} satisfies PropertyControls<ExplainPopoverProps>;

export const explainPopoverPropsContext = createContext<ExplainPopoverProps>(null);