import {ErrorBoundary} from "react-error-boundary";
import type {ComponentType, PropsWithoutRef, RefAttributes} from "react";
import { forwardRef} from "react";

export default function withErrorBoundary<T, TProps extends object>(Component: ComponentType<TProps & RefAttributes<T>>): ComponentType<PropsWithoutRef<TProps> & RefAttributes<T>> {
    return forwardRef<T, TProps>((props, ref) => (
        <ErrorBoundary fallbackRender={() => <span>Component crashed</span>}>
            {/* forwardRef strips "ref" from the props type (PropsWithoutRef), which TypeScript cannot relate back to a generic TProps. */}
            <Component {...props as TProps} ref={ref}/>
        </ErrorBoundary>
    ));
}