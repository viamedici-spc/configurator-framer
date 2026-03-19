import {addPropertyControls, ControlType, PropertyControls} from "framer"
import {ReactNode, useMemo} from "react";
import withErrorBoundary from "../common/withErrorBoundary";
import {TemplateSlotIndex, templateSlotIndices, TemplateSlotsContext} from "../common/templateSlotsContext";

type SetTemplateSlotsProps = { template?: ReactNode, } & { [K in `content${TemplateSlotIndex}`]?: ReactNode };

const SetTemplateSlots = withErrorBoundary((props: SetTemplateSlotsProps) => {
    const slots = useMemo(
        () => new Map(templateSlotIndices.map(index => [index, props[`content${index}`]])),
        [props.content1, props.content2, props.content3, props.content4, props.content5]
    );

    return (
        <TemplateSlotsContext.Provider value={slots}>
            {props.template}
        </TemplateSlotsContext.Provider>
    )
})

export default SetTemplateSlots;

const propertyControls: PropertyControls<SetTemplateSlotsProps> = {
    template: {
        title: "Template",
        type: ControlType.ComponentInstance,
    },
    ...createContentPropertyControls(),
}

addPropertyControls(SetTemplateSlots, propertyControls);

function createContentControl(index: TemplateSlotIndex) {
    return {
        title: `Content ${index}`,
        type: ControlType.ComponentInstance,
    } as const;
}

function createContentPropertyControls(): Omit<PropertyControls<SetTemplateSlotsProps>, "template"> {
    return Object.fromEntries(templateSlotIndices.map(index => [`content${index}`, createContentControl(index)])
    ) as Omit<PropertyControls<SetTemplateSlotsProps>, "template">;
}
