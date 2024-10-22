import {addPropertyControls, ControlType, PropertyControls} from "framer"
import {useConfigurationReset} from "@viamedici-spc/configurator-react"
import useRenderPlaceholder from "../hooks/useRenderPlaceholder";
import {ReactNode} from "react";
import withErrorBoundary from "../common/withErrorBoundary";
import cloneChildrenWithProps from "../common/cloneChildrenWithProps";
import {showResetConfigurationFailure} from "../common/failureAlerts";

type Props = {
    enabledChildren: ReactNode,
    disabledChildren: ReactNode
}

/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 */
const ResetConfiguration = withErrorBoundary((props: Props) => {
    const renderPlaceholder = useRenderPlaceholder();
    if (renderPlaceholder) {
        return props.enabledChildren;
    }

    const {canResetConfiguration, resetConfiguration} = useConfigurationReset();
    const onClick = async () => {
        if (!canResetConfiguration) {
            return;
        }

        try {
            await resetConfiguration()
        } catch {
            showResetConfigurationFailure();
        }
    }

    const children = canResetConfiguration ? props.enabledChildren : props.disabledChildren;
    return cloneChildrenWithProps(children, {onClick})
})

export default ResetConfiguration;

const propertyControls: PropertyControls<Props> = {
    enabledChildren: {
        title: "Content – Enabled",
        type: ControlType.ComponentInstance,
    },
    disabledChildren: {
        title: "Content – Disabled",
        type: ControlType.ComponentInstance,
    }
}

addPropertyControls(ResetConfiguration, propertyControls);