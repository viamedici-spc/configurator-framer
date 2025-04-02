import {ControlType, PropertyControls} from "framer";
import {attributeIdPropertyControls, AttributeIdProps} from "./attributeIdProps";

export type WizardAttributeRelationsProps = {
    wizardAttributeRelations: {
        wizardSteps: WizardStep[]
    }
}

export type WizardStep = {
    name: string,
    attributes: AttributeIdProps[]
}

export const wizardAttributeRelationsPropertyControls = {
    wizardAttributeRelations: {
        title: "Wizard Attribute Relations",
        type: ControlType.Object,
        defaultValue: null,
        buttonTitle: "Definition…",
        controls: {
            wizardSteps: {
                title: "Wizard Steps",
                type: ControlType.Array,
                control: {
                    type: ControlType.Object,
                    controls: {
                        name: {
                            title: "Name",
                            type: ControlType.String
                        },
                        attributes: {
                            title: "Attributes",
                            type: ControlType.Array,
                            control: {
                                type: ControlType.Object,
                                controls: attributeIdPropertyControls
                            }
                        }
                    }
                }
            }
        }

    }
} satisfies PropertyControls<WizardAttributeRelationsProps>;
