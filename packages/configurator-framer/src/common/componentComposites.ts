import withExplainPopover from "../hoc/withExplainPopover";
import type {ComponentType, ForwardRefRenderFunction, PropsWithoutRef, RefAttributes} from "react";
import {forwardRef} from "react";
import withErrorBoundary from "./withErrorBoundary";
import withControlId from "./controlId";
import type {ExplainProps} from "../props/explainProps";

/**
 * Makes a Framer code component that can start an explain process: in an error boundary ({@link withErrorBoundary}),
 * as a control ({@link withControlId}), and inside an explain popover while its `explain` prop is "popover". The ref is
 * forwarded to the render function.
 */
export function explainableComponent<T, TProps extends ExplainProps>(
    Component: ForwardRefRenderFunction<T, PropsWithoutRef<TProps>>,
): ComponentType<PropsWithoutRef<TProps> & RefAttributes<T>> {
    return withErrorBoundary(withControlId(withExplainPopover(forwardRef<T, TProps>(Component)))) as ComponentType<
        PropsWithoutRef<TProps> & RefAttributes<T>
    >;
}