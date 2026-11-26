import type { PropertyControls} from "framer";
import {addPropertyControls, ControlType} from "framer"
import {useConfigurationInitialization} from "@viamedici-spc/configurator-react"
import useRenderPlaceholder from "../hooks/useRenderPlaceholder";
import type {PropsWithChildren} from "react";
import withErrorBoundary from "../common/withErrorBoundary";
import cloneChildrenWithProps from "../common/cloneChildrenWithProps";

/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 */
const InitializationRetry = withErrorBoundary((props: PropsWithChildren) => {
    const renderPlaceholder = useRenderPlaceholder();
    if (renderPlaceholder) {
        return props.children;
    }

    const {error} = useConfigurationInitialization();

    if (!error) {
        return null;
    }

    return cloneChildrenWithProps(props.children, {onClick: error.retry});
})

export default InitializationRetry;

const propertyControls: PropertyControls<PropsWithChildren> = {
    children: {
        title: "Content",
        type: ControlType.ComponentInstance,
    }
}

addPropertyControls(InitializationRetry, propertyControls);