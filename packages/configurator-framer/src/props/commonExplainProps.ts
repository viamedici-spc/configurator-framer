import {ControlType, PropertyControls} from "framer";

export type CommonExplainProps = {
    applySolutionButtonCaption: string;
    configurationSubjectTitle: string;
    componentDecisionStateIncludedLabel: string;
    componentDecisionStateExcludedLabel: string;
    booleanDecisionStateTrueLabel: string;
    booleanDecisionStateFalseLabel: string;
    isBlockedSuffix: string;
    isNotSatisfiedSuffix: string;
}

export const commonExplainPropertyControls = {
    applySolutionButtonCaption: {
        title: "Apply Solution Button Caption",
        type: ControlType.String,
        defaultValue: "Apply Solution"
    },
    configurationSubjectTitle: {
        title: "Configuration Subject Title",
        type: ControlType.String,
        defaultValue: "Configuration"
    },
    componentDecisionStateIncludedLabel: {
        title: "Component Decision State Included Label",
        type: ControlType.String,
        defaultValue: "Included"
    },
    componentDecisionStateExcludedLabel: {
        title: "Component Decision State Excluded Label",
        type: ControlType.String,
        defaultValue: "Excluded"
    },
    booleanDecisionStateTrueLabel: {
        title: "Boolean Decision State True Label",
        type: ControlType.String,
        defaultValue: "Yes"
    },
    booleanDecisionStateFalseLabel: {
        title: "Boolean Decision State False Label",
        type: ControlType.String,
        defaultValue: "No"
    },
    isBlockedSuffix: {
        title: "Is Blocked Suffix",
        type: ControlType.String,
        defaultValue: "is blocked"
    },
    isNotSatisfiedSuffix: {
        title: "Is Not Satisfied Suffix",
        type: ControlType.String,
        defaultValue: "is not satisfied"
    },
} satisfies PropertyControls<CommonExplainProps>;