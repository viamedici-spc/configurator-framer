import type { PropertyControls} from "framer";
import {ControlType} from "framer";
import type { AttributeIdProps} from "./attributeIdProps";
import {attributeIdPropertyControls} from "./attributeIdProps";

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
        // Framer's type has no null here; the control passes null as its default.
        defaultValue: null as unknown as undefined,
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
