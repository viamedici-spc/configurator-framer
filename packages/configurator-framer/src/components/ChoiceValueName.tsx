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

type Props = AttributeIdProps & ChoiceValueIdProps & {
    children: ReactNode,
    customName?: string,
    mode: "replace" | "set-prop",
    replaceString: string,
    elementName: string,
    propName: string
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
    if (mode === "replace") {
        return (
            <Replacer match={n => typeof n === "string"}
                      replace={s => s === replaceString ? name : s}>
                {children}
            </Replacer>
        )
    } else if (mode === "set-prop") {
        return (
            <Replacer match={(e: ReactElement) => (e.type as any)?.displayName === elementName}
                      replace={(element: ReactElement) => cloneElement(element, {[normalizePropName(propName)]: name})}>
                {children}
            </Replacer>
        )
    }
    return children
})

export default ChoiceValueName;

const propertyControls: PropertyControls<Props> = {
    children: {
        title: "Content",
        type: ControlType.ComponentInstance,
    },
    ...attributeIdPropertyControls,
    ...choiceValueIdPropertyControls,
    customName: {
        title: "Custom Name",
        type: ControlType.String
    },
    mode: {
        title: "Mode",
        type: ControlType.Enum,
        defaultValue: "replace",
        options: ["replace", "set-prop"],
        displaySegmentedControl: true
    },
    replaceString: {
        title: "Replace Text",
        type: ControlType.String,
        defaultValue: "<ChoiceValueName>",
        hidden: p => p.mode !== "replace"
    },
    elementName: {
        title: "Element Name",
        type: ControlType.String,
        hidden: p => p.mode !== "set-prop"
    },
    propName: {
        title: "Property Name",
        type: ControlType.String,
        hidden: p => p.mode !== "set-prop"
    }
}

addPropertyControls(ChoiceValueName, propertyControls);