import {ControlType, PropertyControls} from "framer";
import {createExplainHeaderPropertyControls, ExplainHeaderProps} from "./explainHeaderProps";
import {createTextPropertyControls, TextProps} from "../textProps";
import {createPaddingPropertyControls, PaddingProps} from "../paddingProps";
import {BorderProps, createBorderPropertyControls} from "../borderProps";
import {ButtonProps, createButtonPropertyControls} from "../buttonProps";
import DeepPartial from "../DeepPartial";
import {createMarginPropertyControls, MarginProps} from "../marginProps";

export type CommonExplainProps = {
    header: ExplainHeaderProps,
    attributeName: TextProps,
    attributeValue: PaddingProps & {
        add: TextProps & BorderProps & {
            fill: string,
            iconFill: string,
            iconColor: string
        },
        remove: TextProps & BorderProps & {
            fill: string,
            iconFill: string,
            iconColor: string
        },
        componentDecisionStateIncludedLabel: string,
        componentDecisionStateExcludedLabel: string,
        booleanDecisionStateTrueLabel: string,
        booleanDecisionStateFalseLabel: string,
    },
    applySolutionButton: ButtonProps & MarginProps;
    closeButton: ButtonProps;
    infoMessage: TextProps,
}

export const createCommonExplainPropertyControls = (defaults: DeepPartial<CommonExplainProps> = {}) => ({
    header: {
        title: "Header",
        type: ControlType.Object,
        controls: {
            ...createExplainHeaderPropertyControls(defaults.header ?? {})
        }
    },
    attributeName: {
        title: "Attribute Name",
        type: ControlType.Object,
        controls: {
            ...createTextPropertyControls(defaults.attributeName ?? {})
        }
    },
    attributeValue: {
        title: "Attribute Value",
        type: ControlType.Object,
        controls: {
            add: {
                title: "Adding",
                type: ControlType.Object,
                controls: {
                    ...createTextPropertyControls(defaults.attributeValue?.add ?? {}),
                    ...createBorderPropertyControls(defaults.attributeValue?.add ?? {}),
                    fill: {
                        title: "Fill",
                        type: ControlType.Color,
                        defaultValue: defaults.attributeValue?.add?.fill
                    },
                    iconFill: {
                        title: "Icon Fill",
                        type: ControlType.Color,
                        defaultValue: defaults.attributeValue?.add?.iconFill
                    },
                    iconColor: {
                        title: "Icon Color",
                        type: ControlType.Color,
                        defaultValue: defaults.attributeValue?.add?.iconColor
                    },
                }
            },
            remove: {
                title: "Removing",
                type: ControlType.Object,
                controls: {
                    ...createTextPropertyControls(defaults.attributeValue?.remove ?? {}),
                    ...createBorderPropertyControls(defaults.attributeValue?.remove ?? {}),
                    fill: {
                        title: "Fill",
                        type: ControlType.Color,
                        defaultValue: defaults.attributeValue?.remove?.fill
                    },
                    iconFill: {
                        title: "Icon Fill",
                        type: ControlType.Color,
                        defaultValue: defaults.attributeValue?.remove?.iconFill
                    },
                    iconColor: {
                        title: "Icon Color",
                        type: ControlType.Color,
                        defaultValue: defaults.attributeValue?.remove?.iconColor
                    },
                }
            },
            ...createPaddingPropertyControls(defaults.attributeValue ?? {}),
            componentDecisionStateIncludedLabel: {
                title: "Component Decision State Included Label",
                type: ControlType.String,
                defaultValue: defaults.attributeValue?.componentDecisionStateIncludedLabel ?? "Included"
            },
            componentDecisionStateExcludedLabel: {
                title: "Component Decision State Excluded Label",
                type: ControlType.String,
                defaultValue: defaults.attributeValue?.componentDecisionStateExcludedLabel ?? "Excluded"
            },
            booleanDecisionStateTrueLabel: {
                title: "Boolean Decision State True Label",
                type: ControlType.String,
                defaultValue: defaults.attributeValue?.booleanDecisionStateTrueLabel ?? "Yes"
            },
            booleanDecisionStateFalseLabel: {
                title: "Boolean Decision State False Label",
                type: ControlType.String,
                defaultValue: defaults.attributeValue?.booleanDecisionStateFalseLabel ?? "No"
            }
        }
    },
    applySolutionButton: {
        title: "Apply Solution Button",
        type: ControlType.Object,
        controls: {
            ...createButtonPropertyControls(defaults.applySolutionButton ?? {}),
            ...createMarginPropertyControls(defaults.applySolutionButton ?? {})
        }
    },
    closeButton: {
        title: "Close Button",
        type: ControlType.Object,
        controls: {
            ...createButtonPropertyControls(defaults.closeButton ?? {})
        }
    },
    infoMessage: {
        title: "Info Message",
        type: ControlType.Object,
        controls: {
            ...createTextPropertyControls(defaults.infoMessage ?? {})
        }
    }
}) satisfies PropertyControls<CommonExplainProps>;