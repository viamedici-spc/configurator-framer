import {addPropertyControls, ControlType, PropertyControls} from "framer"
import useRenderPlaceholder from "../hooks/useRenderPlaceholder";
import withErrorBoundary from "../common/withErrorBoundary";
import {attributeIdPropertyControls, AttributeIdProps} from "../props/attributeIdProps";
import parseGlobalAttributeId from "../common/parseGlobalAttributeId";
import {useNumericAttribute} from "@viamedici-spc/configurator-react";
import {replaceTextPropertyControls, ReplaceTextProps} from "../props/replaceTextProps";
import ReplaceText from "./ReplaceText";

type Props = AttributeIdProps & ReplaceTextProps & {
    fallback: string
}

/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 */
const SelectedNumericValue = withErrorBoundary((props: Props) => {
    const {fallback} = props;
    const globalAttributeId = parseGlobalAttributeId(props);
    const renderPlaceholder = useRenderPlaceholder();

    const getSelectedValue = () => {
        const numericAttribute = useNumericAttribute(globalAttributeId);
        if (!numericAttribute) {
            return "Numeric Attribute not found"
        }

        const value = numericAttribute.attribute.decision?.state;
        return value != null ? value.toLocaleString() : fallback
    }

    const value = renderPlaceholder ? "0.0" : getSelectedValue();
    return <ReplaceText {...props} text={value}/>
})

export default SelectedNumericValue;

const propertyControls: PropertyControls<Props> = {
    ...attributeIdPropertyControls,
    fallback: {
        title: "Unselected Text",
        type: ControlType.String,
        defaultValue: ""
    },
    ...replaceTextPropertyControls("<NumericValue>")
}

addPropertyControls(SelectedNumericValue, propertyControls);