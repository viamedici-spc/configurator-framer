import {addPropertyControls, ControlType, PropertyControls} from "framer";
import {Children, PropsWithChildren, ReactNode} from "react";
import useRenderPlaceholder from "../../../../hooks/useRenderPlaceholder";
import withErrorBoundary from "../../../../common/withErrorBoundary";
import decisionExplanationContext from "../common/decisionExplanationContext";
import useExplainProcess from "../../../../hooks/useExplainProcess";

type Props = {
    content?: ReactNode,
    failedToExplainContent?: ReactNode,
    noExplanationFoundContent?: ReactNode,
    noSolutionFoundContent?: ReactNode
}

/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 */
const ExplainContent = withErrorBoundary((props: PropsWithChildren<Props>) => {
    const renderPlaceholder = useRenderPlaceholder();
    if (renderPlaceholder) {
        return props.content;
    }

    const process = useExplainProcess();
    if (!process) {
        return null;
    }

    const explanation = process.decisionExplanations?.[0];

    return (
        <decisionExplanationContext.Provider value={explanation}>
            <Inner {...props} hasError={process.hasError} hasSolution={Boolean(explanation?.solution)}/>
        </decisionExplanationContext.Provider>
    );
});

export default ExplainContent;

function Inner(props: PropsWithChildren<Props> & { hasError: boolean, hasSolution: boolean }) {
    const {content, failedToExplainContent, noExplanationFoundContent, noSolutionFoundContent, hasError, hasSolution} = props;

    if (hasError) {
        return Children.toArray(failedToExplainContent).length > 0 ? failedToExplainContent : <span>Failed to explain.</span>;
    }

    const explanationMissing = useDecisionExplanationMissing();
    if (explanationMissing) {
        return Children.toArray(noExplanationFoundContent).length > 0 ? noExplanationFoundContent : <span>No explanation found.</span>;
    }

    if (!hasSolution) {
        return Children.toArray(noSolutionFoundContent).length > 0 ? noSolutionFoundContent : <span>No solution found.</span>;
    }

    return content ?? null;
}

function useDecisionExplanationMissing() {
    return !useExplainProcess()?.decisionExplanations?.[0];
}

const propertyControls: PropertyControls<Props> = {
    content: {
        title: "Content",
        type: ControlType.ComponentInstance
    },
    failedToExplainContent: {
        title: "Content – Failed to Explain",
        type: ControlType.ComponentInstance
    },
    noExplanationFoundContent: {
        title: "Content – No Explanation Found",
        type: ControlType.ComponentInstance
    },
    noSolutionFoundContent: {
        title: "Content – No Solution Found",
        type: ControlType.ComponentInstance
    }
};

addPropertyControls(ExplainContent, propertyControls);
