import type {PropertyControls} from "framer";
import {ControlType} from "framer";

export type ChoiceValueIdProps = {
    choiceValueId: string;
};

export const choiceValueIdPropertyControls = {
    choiceValueId: {
        title: "Choice Value Id",
        type: ControlType.String,
    },
} satisfies PropertyControls<ChoiceValueIdProps>;