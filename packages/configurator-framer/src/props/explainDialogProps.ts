import {ControlType, PropertyControls} from "framer";

export type ExplainDialogProps = {
    attributeValueFill: string
    attributeValueAddFill: string
    attributeValueAddColor: string
    attributeValueRemoveFill: string
    attributeValueRemoveColor: string
    headerValueColor: string
    fill: string
    color: string
    closeButtonOutline: string
    applySolutionButtonFill: string
    applySolutionButtonColor: string
    applySolutionButtonOutline: string
    explanationCard: string
    scrollShadowBorder: string
    backdropFilter: string
}

export const explainDialogPropertyControls = {
    fill: {
        title: "Fill",
        type: ControlType.Color,
        defaultValue: "rgba(255, 255, 255, 0.7)"
    },
    color: {
        title: "Color",
        type: ControlType.Color,
        defaultValue: "#171717"
    },
    attributeValueFill: {
        title: "Attribute Value Fill",
        type: ControlType.Color,
        defaultValue: "#efefef"
    },
    attributeValueAddFill: {
        title: "Attribute Value Add Fill",
        type: ControlType.Color,
        defaultValue: "#cfefc7"
    },
    attributeValueAddColor: {
        title: "Attribute Value Add Color",
        type: ControlType.Color,
        defaultValue: "#48c52b"
    },
    attributeValueRemoveFill: {
        title: "Attribute Value Remove Fill",
        type: ControlType.Color,
        defaultValue: "#ffdada"
    },
    attributeValueRemoveColor: {
        title: "Attribute Value Remove Color",
        type: ControlType.Color,
        defaultValue: "#c52b2b"
    },
    headerValueColor: {
        title: "Header Value Color",
        type: ControlType.Color,
        defaultValue: "#00a1e6"
    },
    closeButtonOutline: {
        title: "Close Button Outline",
        type: ControlType.Color,
        defaultValue: "#00a1e6"
    },
    applySolutionButtonFill: {
        title: "Apply Solution Button Fill",
        type: ControlType.Color,
        defaultValue: "#F2F2F2"
    },
    applySolutionButtonColor: {
        title: "Apply Solution Button Color",
        type: ControlType.Color,
        defaultValue: "#171717"
    },
    applySolutionButtonOutline: {
        title: "Apply Solution Button Outline",
        type: ControlType.Color,
        defaultValue: "#00a1e6"
    },
    explanationCard: {
        title: "Explanation Card",
        type: ControlType.Color,
        defaultValue: "white"
    },
    scrollShadowBorder: {
        title: "Scroll Shadow Border",
        type: ControlType.Color,
        defaultValue: "rgba(0, 0, 0, 0.3)"
    },
    backdropFilter: {
        title: "Backdrop Filter",
        type: ControlType.String,
        defaultValue: "blur(10px) saturate(200%)"
    }
} satisfies PropertyControls<ExplainDialogProps>;
