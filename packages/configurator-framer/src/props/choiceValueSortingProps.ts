import {ControlType, PropertyControls} from "framer";
import {ChoiceValueId} from "@viamedici-spc/configurator-ts";
import {attributeIdPropertyControls, AttributeIdProps} from "./attributeIdProps";

export type ChoiceValueSortingProps = {
    choiceValueSorting: ChoiceValueSorting & {
        jsonDefinition: string
    }
}

export type ChoiceValueSorting = {
    defaultRules: SortingRule[],
    attributes: Array<AttributeIdProps & {
        choiceValues: ChoiceValueId[],
        rules: SortingRule[]
    }>
}

export type SortingRule = {
    regex: string,
    direction: "asc" | "desc",
    mode: "isMatch" | "string" | "numeric",
    description?: string,
}

const sortingRulePropertyControls = {
    description: {
        title: "Description",
        type: ControlType.String
    },
    regex: {
        title: "Regex",
        type: ControlType.String
    },
    direction: {
        title: "Direction",
        type: ControlType.Enum,
        defaultValue: "asc",
        options: ["asc", "desc"],
        displaySegmentedControl: true
    },
    mode: {
        title: "Mode",
        type: ControlType.Enum,
        defaultValue: "isMatch",
        options: ["isMatch", "string", "numeric"]
    }
} satisfies PropertyControls<SortingRule>;

export const choiceValueSortingPropertyControls = {
    choiceValueSorting: {
        title: "Choice Value Sorting",
        type: ControlType.Object,
        defaultValue: null,
        buttonTitle: "Definition…",
        controls: {
            defaultRules: {
                title: "Default Rules",
                type: ControlType.Array,
                control: {
                    type: ControlType.Object,
                    controls: sortingRulePropertyControls
                }
            },
            attributes: {
                title: "Attribute",
                type: ControlType.Array,
                control: {
                    type: ControlType.Object,
                    controls: {
                        ...attributeIdPropertyControls,
                        choiceValues: {
                            title: "Choice Values",
                            type: ControlType.Array,
                            control: {
                                type: ControlType.String
                            }
                        },
                        rules: {
                            title: "Rules",
                            type: ControlType.Array,
                            control: {
                                type: ControlType.Object,
                                controls: sortingRulePropertyControls
                            }
                        }
                    }
                }
            },
            jsonDefinition: {
                title: "Definition – JSON",
                type: ControlType.String,
                displayTextArea: true
            }
        }
    }
} satisfies PropertyControls<ChoiceValueSortingProps>;
