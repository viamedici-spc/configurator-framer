import {Children, ReactElement, ReactNode} from "react";

export function getItemTemplate(itemTemplate: ReactNode): ReactElement | null {
    const findItemTemplate = (c: ReactNode): ReactElement | null => {
        const component = Children.toArray(c)[0] as ReactElement | undefined;
        const children = component?.props?.children;
        if (children) {
            return findItemTemplate(children);
        }
        return component ?? null;
    };

    // The passed props.itemTemplate is wrapped by framer; sometimes multiple times.
    // Traverse the component tree until we find the component without any children. This is our real itemTemplate.
    return findItemTemplate(itemTemplate);
}
