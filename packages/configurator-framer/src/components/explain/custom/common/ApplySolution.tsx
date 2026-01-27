import {addPropertyControls, ControlType, PropertyControls} from "framer";
import {PropsWithChildren, ReactNode} from "react";
import useRenderPlaceholder from "../../../../hooks/useRenderPlaceholder";
import withErrorBoundary from "../../../../common/withErrorBoundary";
import cloneChildrenWithProps from "../../../../common/cloneChildrenWithProps";
import {useDecisionExplanationContext} from "./decisionExplanationContext";
import useExplainProcess from "../../../../hooks/useExplainProcess";

type Props = {
    children: ReactNode
}

/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 */
const ApplySolution = withErrorBoundary((props: PropsWithChildren<Props>) => {
    const renderPlaceholder = useRenderPlaceholder();
    if (renderPlaceholder) {
        return props.children;
    }

    const process = useExplainProcess();
    const explanation = useDecisionExplanationContext();
    const solution = explanation?.solution ?? null;

    if (!solution) {
        return null;
    }

    const onClick = async () => {
        if (!solution || !process) {
            return;
        }

        await process.applySolution(solution);
    };

    return cloneChildrenWithProps(props.children, {onClick});
});

export default ApplySolution;

const propertyControls: PropertyControls<Props> = {
    children: {
        title: "Content",
        type: ControlType.ComponentInstance,
    }
};

addPropertyControls(ApplySolution, propertyControls);
