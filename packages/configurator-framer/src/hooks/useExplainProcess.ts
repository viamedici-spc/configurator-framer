import type {ExplainContext, ExplainProcess} from "../common/explain";
import {explainContext} from "../common/explain";
import useRequiredContext from "../common/useRequiredContext";

export type UseExplainProcessResult = ExplainProcess & {
    switchMode: ExplainContext["switchMode"];
    applySolution: ExplainContext["applySolution"];
    dismiss: ExplainContext["dismiss"];
};

export default function useExplainProcess(): UseExplainProcessResult | null {
    const {process, switchMode, applySolution, dismiss} = useRequiredContext(explainContext, "Configuration");

    if (!process) {
        return null;
    }

    return {
        ...process,
        switchMode,
        applySolution,
        dismiss,
    } satisfies UseExplainProcessResult;
}

/**
 * For components that are only rendered while an explain process is ongoing, i.e. inside the explain popover or dialog.
 */
export function useOngoingExplainProcess(): UseExplainProcessResult {
    const process = useExplainProcess();

    if (process == null) {
        throw new Error("This component must only be rendered while an explain process is ongoing");
    }

    return process;
}