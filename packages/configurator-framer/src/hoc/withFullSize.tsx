import {ComponentType, CSSProperties, forwardRef, PropsWithoutRef, RefAttributes} from "react";

export default function withFullSize<T, TProps extends { style?: CSSProperties }>(Component: ComponentType<TProps>): ComponentType<PropsWithoutRef<TProps> & RefAttributes<T>> {
    return forwardRef<T, TProps>((props, ref) => {
        const extendedStyles: CSSProperties = {
            ...props.style,
            width: "100%",
            height: "100%"
        };

        return <Component {...props} ref={ref} style={extendedStyles}/>
    });
}