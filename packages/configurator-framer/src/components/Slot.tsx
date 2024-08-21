import {addPropertyControls, ControlType, PropertyControls} from "framer"
import {PropsWithChildren} from "react";

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