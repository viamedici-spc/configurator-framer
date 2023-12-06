import {addPropertyControls, ControlType, PropertyControls} from "framer"
import {useAttributes, useConfiguration} from "@viamedici-spc/configurator-react"
import useRenderPlaceholder from "../hooks/useRenderPlaceholder";
import parseGlobalAttributeId from "../common/parseGlobalAttributeId";
import {PropsWithChildren, ReactNode} from "react";
import {attributeIdPropertyControls, AttributeIdProps} from "../props/attributeIdProps";
import withErrorBoundary from "../common/withErrorBoundary";
import cloneChildrenWithProps from "../common/cloneChildrenWithProps";
import useExplain from "../hooks/useExplain";
import {explainPropertyControls, ExplainProps} from "../props/explainProps";
import {useControlId} from "../common/controlId";
import {explainableComponent} from "../common/componentComposites";

type Props = AttributeIdProps & ExplainProps & {
    satisfiedChildren: ReactNode,
    unsatisfiedChildren: ReactNode,
    attributes: AttributeIdProps[]
}

/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 */
const SatisfactionIndicator = explainableComponent<HTMLElement, PropsWithChildren<Props>>((props, ref) => {
    const renderPlaceholder = useRenderPlaceholder();
    if (renderPlaceholder) {
        return props.satisfiedChildren;
    }

    const controlId = useControlId();
    const {configuration} = useConfiguration();
    const {explain} = useExplain();

    const attributeId = props.attributeId.length > 0 ? [parseGlobalAttributeId(props)] : [];
    const attributeIds = [...attributeId, ...props.attributes.map(parseGlobalAttributeId)];

    const getAttributesSatisfied = () => {
        const attributes: { isSatisfied?: boolean, error?: ReactNode }[] = useAttributes(attributeIds).map(attribute => {
            if (!attribute) {
                return {
                    error: <span>Attribute not found</span>
                };
            }

            return {
                isSatisfied: attribute.isSatisfied
            }
        });

        const error = attributes.find(a => a.error)?.error;
        if (error) {
            return error;
        }

        return attributes.every(a => a.isSatisfied);
    }

    const onClick = async () => {
        if (props.explain === "disabled") return;
        if (attributeIds.length === 0) {
            await explain(b => b.whyIsNotSatisfied.configuration, props.explain, controlId);
        } else if (attributeIds.length === 1) {
            await explain(b => b.whyIsNotSatisfied.attribute(attributeIds[0]), props.explain, controlId);
        }
    }

    const isSatisfied = attributeIds.length > 0 ? getAttributesSatisfied() : configuration.isSatisfied;
    return isSatisfied ? props.satisfiedChildren : cloneChildrenWithProps(props.unsatisfiedChildren, {onClick, ref});
})

export default SatisfactionIndicator;

const propertyControls: PropertyControls<Props> = {
    satisfiedChildren: {
        title: "Content – Satisfied",
        type: ControlType.ComponentInstance,
    },
    unsatisfiedChildren: {
        title: "Content – Unsatisfied",
        type: ControlType.ComponentInstance,
    },
    ...attributeIdPropertyControls,
    attributes: {
        title: "Attributes",
        type: ControlType.Array,
        control: {
            type: ControlType.Object,
            controls: {
                ...attributeIdPropertyControls
            }
        }
    },
    ...explainPropertyControls
}

addPropertyControls(SatisfactionIndicator, propertyControls);