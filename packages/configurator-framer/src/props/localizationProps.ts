import type {PropertyControls} from "framer";
import {ControlType} from "framer";
import type {AttributeIdProps} from "./attributeIdProps";
import type {ChoiceValueIdProps} from "./choiceValueIdProps";

export type LocalizationProps = {
    localization: {
        jsonDefinition: string;
    };
};

export type LocalizableText = Array<{localeCode: string; translation: string}>;

export type Localization = {
    attributes: Array<AttributeIdProps & {name: LocalizableText}>;
    choiceValues: Array<AttributeIdProps & ChoiceValueIdProps & {name: LocalizableText}>;
};

export const localizationPropertyControls = {
    localization: {
        title: "Localization",
        type: ControlType.Object,
        // Framer's type has no null here; the control passes null as its default.
        defaultValue: null as unknown as undefined,
        buttonTitle: "Definition…",
        controls: {
            jsonDefinition: {
                title: "Definition – JSON",
                type: ControlType.String,
                displayTextArea: true,
            },
        },
    },
} satisfies PropertyControls<LocalizationProps>;