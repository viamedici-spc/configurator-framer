import {addPropertyControls, ControlType, PropertyControls} from "framer"
import useRenderPlaceholder from "../hooks/useRenderPlaceholder";
import {cloneElement, ReactElement, ReactNode} from "react";
import withErrorBoundary from "../common/withErrorBoundary";
import {attributeIdPropertyControls, AttributeIdProps} from "../props/attributeIdProps";
import {useChoiceValueName} from "../hooks/localization";
import parseGlobalAttributeId from "../common/parseGlobalAttributeId";
import {Replacer} from "../common/react-element-replace/Replacer";
import {useChoiceAttribute} from "@viamedici-spc/configurator-react";
import {choiceValueIdPropertyControls, ChoiceValueIdProps} from "../props/choiceValueIdProps";
import normalizePropName from "../common/normalizePropName";
import {replaceTextPropertyControls, ReplaceTextProps} from "../props/replaceTextProps";
import ReplaceText from "./ReplaceText";

type Props = AttributeIdProps & ChoiceValueIdProps & ReplaceTextProps & {
    customName?: string
}

/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 */
const ChoiceValueName = withErrorBoundary((props: Props) => {
    const {choiceValueId, children, customName, mode, replaceString, propName, elementName} = props;
    const globalAttributeId = parseGlobalAttributeId(props);
    const hasCustomName = customName.length > 0;
    const hasChoiceValueId = choiceValueId.length > 0;
    const renderPlaceholder = useRenderPlaceholder();

    const getChoiceValueName = () => {
        const choiceAttribute = useChoiceAttribute(globalAttributeId);
        if (!choiceAttribute) {
            return "Choice Attribute not found"
        }

        if (!hasChoiceValueId) {
            return "Choice Value Id missing";
        }

        let choiceValue = choiceAttribute.attribute.values.find((v) => v.id === choiceValueId);
        if (choiceValue == null) {
            return "Choice Value not found";
        }

        return useChoiceValueName(globalAttributeId, choiceValueId) ?? choiceValueId
    }

    const name = hasCustomName ? customName : renderPlaceholder ? choiceValueId.length > 0 ? choiceValueId : "Choice Value" : getChoiceValueName();
    return <ReplaceText {...props} text={name}/>
})

export default ChoiceValueName;

const propertyControls: PropertyControls<Props> = {
    ...attributeIdPropertyControls,
    ...choiceValueIdPropertyControls,
    customName: {
        title: "Custom Name",
        type: ControlType.String
    },
    ...replaceTextPropertyControls("<ChoiceValueName>")
}

addPropertyControls(ChoiceValueName, propertyControls);