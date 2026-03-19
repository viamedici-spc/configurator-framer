import {addPropertyControls, ControlType, PropertyControls} from "framer"
import {useContext} from "react";
import withErrorBoundary from "../common/withErrorBoundary";
import {TemplateSlotIndex, TemplateSlotsContext} from "../common/templateSlotsContext";

type Props = {
    index: TemplateSlotIndex,
}

/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 */
const TemplateSlot = withErrorBoundary((props: Props) => {
    const slots = useContext(TemplateSlotsContext);
    const content = slots?.get(props.index);

    return content ?? <span>No content found for slot {props.index}</span>
})

export default TemplateSlot;

const propertyControls: PropertyControls<Props> = {
    index: {
        title: "Index",
        type: ControlType.Enum,
        defaultValue: 1,
        options: [1, 2, 3, 4, 5]
    }
}

addPropertyControls(TemplateSlot, propertyControls);
