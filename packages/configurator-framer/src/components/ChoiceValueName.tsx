import type {PropertyControls} from "framer";
import {addPropertyControls, ControlType} from "framer";
import useRenderPlaceholder from "../hooks/useRenderPlaceholder";
import withErrorBoundary from "../common/withErrorBoundary";
import type {AttributeIdProps} from "../props/attributeIdProps";
import {attributeIdPropertyControls} from "../props/attributeIdProps";
import {useChoiceValueName} from "../hooks/localization";
import parseGlobalAttributeId from "../common/parseGlobalAttributeId";
import {useChoiceAttribute} from "@viamedici-spc/configurator-react";
import type {ChoiceValueIdProps} from "../props/choiceValueIdProps";
import {choiceValueIdPropertyControls} from "../props/choiceValueIdProps";
import type {ReplaceTextProps} from "../props/replaceTextProps";
import {replaceTextPropertyControls} from "../props/replaceTextProps";
import ReplaceText from "./ReplaceText";

type Props = AttributeIdProps &
    ChoiceValueIdProps &
    ReplaceTextProps & {
        customName?: string;
    };

/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 */
const ChoiceValueName = withErrorBoundary((props: Props) => {
    const {choiceValueId, customName} = props;
    const globalAttributeId = parseGlobalAttributeId(props);
    const hasCustomName = customName != null && customName.length > 0;
    const hasChoiceValueId = choiceValueId.length > 0;
    const renderPlaceholder = useRenderPlaceholder();

    const getChoiceValueName = () => {
        const choiceAttribute = useChoiceAttribute(globalAttributeId);
        if (!choiceAttribute) {
            return "Choice Attribute not found";
        }

        if (!hasChoiceValueId) {
            return "Choice Value Id missing";
        }

        let choiceValue = choiceAttribute.attribute.values.get(choiceValueId);
        if (choiceValue == null) {
            return "Choice Value not found";
        }

        return useChoiceValueName(globalAttributeId, choiceValueId) ?? choiceValueId;
    };

    const name = hasCustomName
        ? customName
        : renderPlaceholder
          ? choiceValueId.length > 0
              ? choiceValueId
              : "Choice Value"
          : getChoiceValueName();
    return <ReplaceText {...props} text={name} />;
});

export default ChoiceValueName;

const propertyControls: PropertyControls<Props> = {
    ...attributeIdPropertyControls,
    ...choiceValueIdPropertyControls,
    customName: {
        title: "Custom Name",
        type: ControlType.String,
    },
    ...replaceTextPropertyControls("<ChoiceValueName>"),
};

addPropertyControls(ChoiceValueName, propertyControls);