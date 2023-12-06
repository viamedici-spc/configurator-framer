import {explainContext, ExplainContext, ExplainProcess} from "../common/explain";
import {useContext} from "react";

export type UseExplainProcessResult = ExplainProcess & {
    switchMode: ExplainContext["switchMode"],
    applySolution: ExplainContext["applySolution"],
    dismiss: ExplainContext["dismiss"]
};

export default function useExplainProcess(): UseExplainProcessResult | null {
    const {process, switchMode, applySolution, dismiss} = useContext(explainContext);

    if (!process) {
        return null;
    }

    return {
        ...process,
        switchMode,
        applySolution,
        dismiss
    } satisfies UseExplainProcessResult;
}