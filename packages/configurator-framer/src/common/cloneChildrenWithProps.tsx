import {Children, cloneElement, HTMLAttributes, isValidElement, ReactNode, Ref} from "react";
import mergeProps from "merge-props";

type PropsWithChildrenAndRef = HTMLAttributes<HTMLElement> & { ref?: Ref<HTMLElement> };

export default function cloneChildrenWithProps(children: ReactNode, additionalProps: PropsWithChildrenAndRef): ReactNode {
    return Children.map(children, child => {
        if (isValidElement(child)) {
            const newProps = mergeProps(child.props, additionalProps);
            return cloneElement(child, newProps);
        }
        return child;
    });
}