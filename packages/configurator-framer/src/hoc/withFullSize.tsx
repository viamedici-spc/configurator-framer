import type {ComponentType, CSSProperties, PropsWithoutRef, RefAttributes} from "react";
import { forwardRef} from "react";

export default function withFullSize<T, TProps extends { style?: CSSProperties }>(Component: ComponentType<TProps & RefAttributes<T>>): ComponentType<PropsWithoutRef<TProps> & RefAttributes<T>> {
    return forwardRef<T, TProps>((props, ref) => {
        const extendedStyles: CSSProperties = {
            ...props.style,
            width: "100%",
            height: "100%"
        };

        // forwardRef strips "ref" from the props type (PropsWithoutRef), which TypeScript cannot relate back to a generic TProps.
        return <Component {...props as TProps} ref={ref} style={extendedStyles}/>
    });
}