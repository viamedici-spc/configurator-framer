import type {ComponentType, CSSProperties, PropsWithoutRef, RefAttributes} from "react";
import {forwardRef} from "react";

/**
 * Makes a component fill its parent: its `style` gets a width and a height of 100%, over a width or height passed in.
 * The ref is forwarded to the component.
 */
export default function withFullSize<T, TProps extends {style?: CSSProperties}>(
    Component: ComponentType<TProps & RefAttributes<T>>,
): ComponentType<PropsWithoutRef<TProps> & RefAttributes<T>> {
    return forwardRef<T, TProps>((props, ref) => {
        const extendedStyles: CSSProperties = {
            ...props.style,
            width: "100%",
            height: "100%",
        };

        // forwardRef strips "ref" from the props type (PropsWithoutRef), which TypeScript cannot relate back to a generic TProps.
        return <Component {...(props as TProps)} ref={ref} style={extendedStyles} />;
    });
}