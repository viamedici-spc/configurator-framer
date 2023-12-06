import {addPropertyControls, ControlType, PropertyControls} from "framer"
import {AttributeType, DecisionKind} from "@viamedici-spc/configurator-ts"
import {useConfiguration, useDecision} from "@viamedici-spc/configurator-react"
import useRenderPlaceholder from "../hooks/useRenderPlaceholder";
import {ReactNode} from "react";
import {match} from "ts-pattern";
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

    const {configuration} = useConfiguration();
    const {setManyDecision} = useDecision();
    // TODO: Move this to ClientLib Interpreter
    const canReset = configuration.attributes.some(a => match(a)
        .with({type: AttributeType.Choice}, a => a.values.some(v => v.decision?.kind === DecisionKind.Explicit))
        .with({type: AttributeType.Boolean}, a => a.decision?.kind === DecisionKind.Explicit)
        .with({type: AttributeType.Numeric}, a => a.decision?.kind === DecisionKind.Explicit)
        .with({type: AttributeType.Component}, a => a.decision?.kind === DecisionKind.Explicit)
        .exhaustive()
    )

    const onClick = () => {
        if (!canReset) {
            return;
        }

        // TODO: Add clearDecisions() to useDecisions hook
        try {
            setManyDecision([], {
                type: "DropExistingDecisions",
                conflictHandling: {
                    type: "Manual",
                    includeConstraintsInConflictExplanation: false
                }
            })
        } catch {
            showResetConfigurationFailure();
        }
    }

    const children = canReset ? props.enabledChildren : props.disabledChildren;
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