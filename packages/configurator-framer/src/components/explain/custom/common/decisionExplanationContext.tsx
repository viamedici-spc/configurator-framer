import {createContext, useContext} from "react";
import {DecisionExplanation} from "@viamedici-spc/configurator-ts";

const decisionExplanationContext = createContext<DecisionExplanation>(null);

export function useDecisionExplanationContext(): DecisionExplanation | null {
    return useContext(decisionExplanationContext);
}

export default decisionExplanationContext;
