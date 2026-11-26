import {createContext, useContext} from "react";
import type {DecisionExplanation} from "@viamedici-spc/configurator-ts";

const decisionExplanationContext = createContext<DecisionExplanation | null>(null);

export function useDecisionExplanationContext(): DecisionExplanation | null {
    return useContext(decisionExplanationContext);
}

export default decisionExplanationContext;
