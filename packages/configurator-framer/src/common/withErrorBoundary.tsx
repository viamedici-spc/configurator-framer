import {ErrorBoundary} from "react-error-boundary";
import type {ComponentType, PropsWithoutRef, RefAttributes} from "react";
import {forwardRef} from "react";

/**
 * Wraps a component in an error boundary: if it throws while rendering, "Component crashed" is shown in its place and
 * the rest of the Framer canvas keeps working. Otherwise it adds no element. The ref is forwarded to the component.
 */
export default function withErrorBoundary<T, TProps extends object>(
    Component: ComponentType<TProps & RefAttributes<T>>,
): ComponentType<PropsWithoutRef<TProps> & RefAttributes<T>> {
    return forwardRef<T, TProps>((props, ref) => (
        <ErrorBoundary fallbackRender={() => <span>Component crashed</span>}>
            {/* forwardRef strips "ref" from the props type (PropsWithoutRef), which TypeScript cannot relate back to a generic TProps. */}
            <Component {...(props as TProps)} ref={ref} />
        </ErrorBoundary>
    ));
}