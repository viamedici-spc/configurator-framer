import type { PropertyControls} from "framer";
import {addPropertyControls, ControlType} from "framer"
import useRenderPlaceholder from "../hooks/useRenderPlaceholder";
import withErrorBoundary from "../common/withErrorBoundary";
import type { AttributeIdProps} from "../props/attributeIdProps";
import {attributeIdPropertyControls} from "../props/attributeIdProps";
import {useAttributeName} from "../hooks/localization";
import parseGlobalAttributeId from "../common/parseGlobalAttributeId";
import {useAttributes} from "@viamedici-spc/configurator-react";
import ReplaceText from "./ReplaceText";
import type { ReplaceTextProps} from "../props/replaceTextProps";
import {replaceTextPropertyControls} from "../props/replaceTextProps";

type Props = AttributeIdProps & ReplaceTextProps & {
    customName?: string
}

/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 */
const AttributeName = withErrorBoundary((props: Props) => {
    const {attributeId, children, customName} = props;
    const globalAttributeId = parseGlobalAttributeId(props);
    const hasCustomName = customName != null && customName.length > 0;
    const renderPlaceholder = useRenderPlaceholder();

    const getAttributeName = () => {
        const attribute = useAttributes([globalAttributeId], false)[0];
        if (!attribute) {
            return "Attribute not found"
        }

        return useAttributeName(globalAttributeId) ?? attributeId
    }

    const name = hasCustomName ? customName : renderPlaceholder ? attributeId : getAttributeName();
    return <ReplaceText {...props} text={name}/>
})

export default AttributeName;

const propertyControls: PropertyControls<Props> = {
    ...attributeIdPropertyControls,
    customName: {
        title: "Custom Name",
        type: ControlType.String
    },
    ...replaceTextPropertyControls("<AttributeName>")
}

addPropertyControls(AttributeName, propertyControls);