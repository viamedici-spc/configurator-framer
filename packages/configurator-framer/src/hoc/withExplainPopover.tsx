import type {ComponentType, PropsWithoutRef, RefAttributes} from "react";
import {forwardRef} from "react";
import ExplainPopover from "../components/explain/ExplainPopover";
import useRenderPlaceholder from "../hooks/useRenderPlaceholder";
import type {ExplainProps} from "../props/explainProps";

export default function withExplainPopover<T, TProps extends ExplainProps>(
    Component: ComponentType<TProps & RefAttributes<T>>,
): ComponentType<PropsWithoutRef<TProps> & RefAttributes<T>> {
    return forwardRef<T, TProps>((props, ref) => {
        const renderPlaceholder = useRenderPlaceholder();

        if (props.explain !== "popover" || renderPlaceholder) {
            return <Component {...(props as TProps)} ref={ref} />;
        }

        return (
            <ExplainPopover>
                <Component {...(props as TProps)} ref={ref} />
            </ExplainPopover>
        );
    });
}