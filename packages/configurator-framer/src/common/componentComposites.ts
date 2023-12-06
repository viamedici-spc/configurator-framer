import withExplainPopover from "../hoc/withExplainPopover";
import {forwardRef, ForwardRefRenderFunction} from "react";
import withErrorBoundary from "./withErrorBoundary";
import withControlId from "./controlId";
import {ExplainProps} from "../props/explainProps";

export function explainableComponent<T, TProps extends ExplainProps>(Component: ForwardRefRenderFunction<T, TProps>) {
    return withErrorBoundary(withControlId(withExplainPopover(forwardRef<T, TProps>(Component))));
}
