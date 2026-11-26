import type {ComponentType, PropsWithoutRef, RefAttributes} from "react";
import {createContext, forwardRef, useContext, useId} from "react";

const controlIdContext = createContext<string | null>(null);
export const useControlId = () => useContext(controlIdContext);

export default function withControlId<T, TProps extends object>(
    Component: ComponentType<TProps & RefAttributes<T>>,
): ComponentType<PropsWithoutRef<TProps> & RefAttributes<T>> {
    return forwardRef<T, TProps>((props, ref) => {
        const controlId = useId();

        return (
            <controlIdContext.Provider value={controlId}>
                {/* forwardRef strips "ref" from the props type (PropsWithoutRef), which TypeScript cannot relate back to a generic TProps. */}
                <Component {...(props as TProps)} ref={ref} />
            </controlIdContext.Provider>
        );
    });
}