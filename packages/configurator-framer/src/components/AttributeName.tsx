import {addPropertyControls, ControlType, PropertyControls} from "framer"
import useRenderPlaceholder from "../hooks/useRenderPlaceholder";
import {ReactNode} from "react";
import withErrorBoundary from "../common/withErrorBoundary";
import {attributeIdPropertyControls, AttributeIdProps} from "../props/attributeIdProps";
import {useAttributeName} from "../hooks/localization";
import parseGlobalAttributeId from "../common/parseGlobalAttributeId";
import {Replacer} from "../common/react-element-replace/Replacer";
import {useAttributes} from "@viamedici-spc/configurator-react";

type Props = AttributeIdProps & {
    children: ReactNode,
    customName?: string
}

/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 */
const AttributeName = withErrorBoundary((props: Props) => {
    const {attributeId, children, customName} = props;
    const globalAttributeId = parseGlobalAttributeId(props);
    const hasCustomName = customName?.length > 0 ?? false;
    const renderPlaceholder = useRenderPlaceholder();

    const getAttributeName = () => {
        const attribute = useAttributes([globalAttributeId], false)[0];
        if (!attribute) {
            return "Attribute not found"
        }

        return useAttributeName(globalAttributeId) ?? attributeId
    }

    const name = hasCustomName ? customName : renderPlaceholder ? attributeId : getAttributeName();

    return (
        <Replacer match={n => typeof n === "string"} replace={s => s === "<AttributeName>" ? name : s}>
            {children}
        </Replacer>
    )
})

export default AttributeName;

const propertyControls: PropertyControls<Props> = {
    children: {
        title: "Content",
        type: ControlType.ComponentInstance,
    },
    ...attributeIdPropertyControls,
    customName: {
        title: "Custom Name",
        type: ControlType.String
    }
}

addPropertyControls(AttributeName, propertyControls);