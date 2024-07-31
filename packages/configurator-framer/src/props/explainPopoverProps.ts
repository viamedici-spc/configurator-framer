import {ControlType, PropertyControls} from "framer";
import {createContext, useContext} from "react";
import {commonExplainPropertyControls, CommonExplainProps} from "./commonExplainProps";

export type ExplainPopoverProps = CommonExplainProps & {
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
    solutionTitle: string;
    showMoreButtonCaption: string;
    showConstraintsButtonCaption: string;
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
    },
    solutionTitle: {
        title: "Solution Title",
        type: ControlType.String,
        defaultValue: "Solution"
    },
    showMoreButtonCaption: {
        title: "Show More Button Caption",
        type: ControlType.String,
        defaultValue: "Show more ({{amount}})"
    },
    showConstraintsButtonCaption: {
        title: "Show Constraints Button Caption",
        type: ControlType.String,
        defaultValue: "Show Constraints"
    },
    ...commonExplainPropertyControls
} satisfies PropertyControls<ExplainPopoverProps>;

export const explainPopoverPropsContext = createContext<ExplainPopoverProps>(null);
export const useExplainPopoverProps = (): ExplainPopoverProps => useContext(explainPopoverPropsContext);