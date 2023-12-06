import {ControlType, PropertyControls} from "framer";

export type AttributeIdProps = {
    attributeId: string
    componentPath: string
    sharedConfigurationModel: string
}

export const attributeIdPropertyControls = {
    attributeId: {
        title: "Attribute Id",
        type: ControlType.String
    },
    componentPath: {
        title: "Component Path",
        type: ControlType.String
    },
    sharedConfigurationModel: {
        title: "Shared Configuration Model",
        type: ControlType.String
    }
} satisfies PropertyControls<AttributeIdProps>;
