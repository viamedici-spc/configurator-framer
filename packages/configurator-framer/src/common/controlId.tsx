import {ComponentType, createContext, forwardRef, PropsWithoutRef, RefAttributes, useContext, useId} from "react";

const controlIdContext = createContext<string>(null);
export const useControlId = () => useContext(controlIdContext);

export default function withControlId<T, TProps>(Component: ComponentType<TProps>): ComponentType<PropsWithoutRef<TProps> & RefAttributes<T>> {
    return forwardRef<T, TProps>((props, ref) => {
        const controlId = useId();

        return (
            <controlIdContext.Provider value={controlId}>
                <Component {...props} ref={ref}/>
            </controlIdContext.Provider>
        )
    })
}