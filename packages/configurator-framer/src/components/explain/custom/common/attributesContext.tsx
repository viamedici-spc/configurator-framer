import {createContext, useContext} from "react";
import {GlobalAttributeId} from "@viamedici-spc/configurator-ts";
import {ChoiceValueNames} from "../../../../hooks/localization";
import {ExplainAttributeDecision} from "../../common/explainAttributes";

export type AttributesContext = {
    attributeId: GlobalAttributeId,
    attributeName: string,
    decisions: ReadonlyArray<ExplainAttributeDecision>,
    choiceValueNames: ChoiceValueNames
};

const attributesContext = createContext<AttributesContext>(null);

export function useAttributesContext() {
    return useContext(attributesContext);
}

export default attributesContext;
