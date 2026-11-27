import type {ComponentType, PropsWithoutRef, RefAttributes} from "react";
import {createContext, forwardRef, useContext, useId} from "react";

const controlIdContext = createContext<string | null>(null);
/**
 * Gets the id of the control the calling component is rendered in, a component made with {@link withControlId}. An
 * explain process carries this id, so the control that started it can show it.
 * @returns The control's id, or `null` outside a control.
 */
export const useControlId = (): string | null => useContext(controlIdContext);

/**
 * Makes a component a control: it and everything inside it get the same id from {@link useControlId}. The ref is
 * forwarded to the component.
 */
export default function withControlId<T, TProps extends object>(
    Component: ComponentType<TProps & RefAttributes<T>>,
): ComponentType<PropsWithoutRef<TProps> & RefAttributes<T>> {
    return forwardRef<T, TProps>((props, ref) => {
        const controlId = useId();

        return (
            <controlIdContext.Provider value={controlId}>
                <Component {...(props as TProps)} ref={ref} />
            </controlIdContext.Provider>
        );
    });
}