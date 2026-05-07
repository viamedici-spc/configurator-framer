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
    applySolutionButton: ButtonProps & MarginProps,
    closeButton: ButtonProps,
    infoMessage: TextProps & {
        whyIsStateNotPossibleQuestion: string,
        whyConfigurationIsNotSatisfiedQuestion: string,
        whyAttributeIsNotSatisfiedQuestion: string,
        generalConflictQuestion: string,
        failedToExplainText: string,
        failedToExplainHintText: string,
        noExplanationFoundText: string,
        noSolutionFoundText: string,
    },
    useCustomExplain: boolean
}

export const createCommonExplainPropertyControls = (defaults: DeepPartial<CommonExplainProps> = {}) => ({
    header: {
        title: "Header",
        type: ControlType.Object,
        controls: {
            ...createExplainHeaderPropertyControls(defaults.header ?? {})
        },
        hidden: (props) => props.useCustomExplain
    },
    attributeName: {
        title: "Attribute Name",
        type: ControlType.Object,
        controls: {
            ...createTextPropertyControls(defaults.attributeName ?? {})
        },
        hidden: (props) => props.useCustomExplain
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
        },
        hidden: (props) => props.useCustomExplain
    },
    closeButton: {
        title: "Close Button",
        type: ControlType.Object,
        controls: {
            ...createButtonPropertyControls(defaults.closeButton ?? {})
        },
        hidden: (props) => props.useCustomExplain
    },
    infoMessage: {
        title: "Info Message",
        type: ControlType.Object,
        controls: {
            ...createTextPropertyControls(defaults.infoMessage ?? {}),
            whyIsStateNotPossibleQuestion: {
                title: "Why Is State Not Possible Question",
                type: ControlType.String,
                defaultValue: defaults.infoMessage?.whyIsStateNotPossibleQuestion ?? "why your selection is not possible"
            },
            whyConfigurationIsNotSatisfiedQuestion: {
                title: "Why Configuration Is Not Satisfied Question",
                type: ControlType.String,
                defaultValue: defaults.infoMessage?.whyConfigurationIsNotSatisfiedQuestion ?? "why your configuration is not satisfied"
            },
            whyAttributeIsNotSatisfiedQuestion: {
                title: "Why Attribute Is Not Satisfied Question",
                type: ControlType.String,
                defaultValue: defaults.infoMessage?.whyAttributeIsNotSatisfiedQuestion ?? "why your attribute is not satisfied"
            },
            generalConflictQuestion: {
                title: "General Conflict Question",
                type: ControlType.String,
                defaultValue: defaults.infoMessage?.generalConflictQuestion ?? "why your selections are not possible"
            },
            failedToExplainText: {
                title: "Failed To Explain Text",
                type: ControlType.String,
                defaultValue: defaults.infoMessage?.failedToExplainText ?? "Failed to explain {{question}}."
            },
            failedToExplainHintText: {
                title: "Failed To Explain Hint Text",
                type: ControlType.String,
                defaultValue: defaults.infoMessage?.failedToExplainHintText ?? "Please check your internet connection and try again."
            },
            noExplanationFoundText: {
                title: "No Explanation Found Text",
                type: ControlType.String,
                defaultValue: defaults.infoMessage?.noExplanationFoundText ?? "There was no explanation found for {{question}}."
            },
            noSolutionFoundText: {
                title: "No Solution Found Text",
                type: ControlType.String,
                defaultValue: defaults.infoMessage?.noSolutionFoundText ?? "There was no solution found for {{question}}."
            },
        },
        hidden: (props) => props.useCustomExplain
    }
}) satisfies PropertyControls<CommonExplainProps>;