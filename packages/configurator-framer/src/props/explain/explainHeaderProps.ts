import {ControlType, PropertyControls} from "framer";
import {createTextPropertyControls, TextProps} from "../textProps";
import DeepPartial from "../DeepPartial";

export type ExplainHeaderProps = {
    subject: TextProps & {
        configurationSubjectTitle: string,
        generalConflictTitle: string,
    },
    suffix: TextProps & {
        isBlockedSuffix: string;
        isNotSatisfiedSuffix: string;
    }
}

export const createExplainHeaderPropertyControls = (defaults: DeepPartial<ExplainHeaderProps> = {}) => ({
    subject: {
        title: "Subject",
        type: ControlType.Object,
        controls: {
            ...createTextPropertyControls(defaults.subject ?? {}),
            configurationSubjectTitle: {
                title: "Configuration Subject Title",
                type: ControlType.String,
                defaultValue: defaults.subject?.configurationSubjectTitle ?? "Configuration"
            },
            generalConflictTitle: {
                title: "General Conflict Title",
                type: ControlType.String,
                defaultValue: defaults.subject?.generalConflictTitle ?? "Conflict"
            }
        }
    },
    suffix: {
        title: "Suffix",
        type: ControlType.Object,
        controls: {
            ...createTextPropertyControls(defaults.suffix ?? {}),
            isBlockedSuffix: {
                title: "Is Blocked Suffix",
                type: ControlType.String,
                defaultValue: defaults.suffix?.isBlockedSuffix ?? "is blocked"
            },
            isNotSatisfiedSuffix: {
                title: "Is Not Satisfied Suffix",
                type: ControlType.String,
                defaultValue: defaults.suffix?.isNotSatisfiedSuffix ?? "is not satisfied"
            },
        }
    }
}) satisfies PropertyControls<ExplainHeaderProps>;