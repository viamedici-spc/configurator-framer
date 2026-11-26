import {createContext, useContext} from "react";
import type {GlobalAttributeId} from "@viamedici-spc/configurator-ts";
import type {ChoiceValueNames} from "../../../../hooks/localization";
import type {ExplainAttributeDecision} from "../../common/explainAttributes";

export type AttributesContext = {
    attributeId: GlobalAttributeId;
    attributeName: string;
    decisions: ReadonlyArray<ExplainAttributeDecision>;
    choiceValueNames: ChoiceValueNames;
};

const attributesContext = createContext<AttributesContext | null>(null);

export function useAttributesContext() {
    return useContext(attributesContext);
}

export default attributesContext;