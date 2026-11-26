import {ErrorBoundary} from "react-error-boundary";
import type {ComponentType, PropsWithoutRef, RefAttributes} from "react";
import { forwardRef} from "react";

export default function withErrorBoundary<T, TProps>(Component: ComponentType<TProps>): ComponentType<PropsWithoutRef<TProps> & RefAttributes<T>> {
    return forwardRef<T, TProps>((props, ref) => (
        <ErrorBoundary fallbackRender={() => <span>Component crashed</span>}>
            <Component {...props} ref={ref}/>
        </ErrorBoundary>
    ));
}