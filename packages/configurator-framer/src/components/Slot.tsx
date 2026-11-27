import type {PropertyControls} from "framer";
import {addPropertyControls, ControlType} from "framer";
import type {PropsWithChildren} from "react";
import withErrorBoundary from "../common/withErrorBoundary";

/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 */
const Slot = withErrorBoundary(function Slot(props: PropsWithChildren) {
    return props.children;
});

export default Slot;

const propertyControls: PropertyControls<PropsWithChildren> = {
    children: {
        title: "Content",
        type: ControlType.ComponentInstance,
    },
};

addPropertyControls(Slot, propertyControls);