import type { PropertyControls} from "framer";
import {addPropertyControls, ControlType} from "framer"
import type {PropsWithChildren} from "react";

/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 */
export default function Slot(props: PropsWithChildren) {
    return props.children
}

const propertyControls: PropertyControls<PropsWithChildren> = {
    children: {
        title: "Content",
        type: ControlType.ComponentInstance,
    }
}

addPropertyControls(Slot, propertyControls);