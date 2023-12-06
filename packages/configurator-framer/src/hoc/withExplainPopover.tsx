import {ComponentType, forwardRef, PropsWithoutRef, ReactNode, RefAttributes} from "react";
import ExplainPopover from "../components/explain/explainPopover/ExplainPopover";
import useRenderPlaceholder from "../hooks/useRenderPlaceholder";
import {ExplainProps} from "../props/explainProps";

export default function withExplainPopover<T, TProps extends ExplainProps>(Component: ComponentType<TProps>): ComponentType<PropsWithoutRef<TProps> & RefAttributes<T>> {
    return forwardRef<T, TProps>((props, ref) => {
        const renderPlaceholder = useRenderPlaceholder();

        if (props.explain !== "popover" || renderPlaceholder) {
            return <Component {...props}/>;
        }

        return (
            <ExplainPopover>
                <Component {...props} ref={ref}/>
            </ExplainPopover>
        )
    })
}