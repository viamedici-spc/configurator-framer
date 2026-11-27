import type {ExplainContext} from "../common/explain";
import {explainContext} from "../common/explain";
import useRequiredContext from "../common/useRequiredContext";

export type UseExplainResult = {
    explain: ExplainContext["explain"];
    handleExplainAnswer: ExplainContext["handleExplainAnswer"];
};

/**
 * Starts explain processes: `explain` asks a question and shows the answer in a popover or a dialog,
 * `handleExplainAnswer` shows an answer the caller already has. Pass the caller's `useControlId()` so the control
 * that started the process can show it.
 * @throws Error "This component must be wrapped in <Configuration />" outside a `<Configuration />`.
 */
export default function useExplain(): UseExplainResult {
    const {explain, handleExplainAnswer} = useRequiredContext(explainContext, "Configuration");

    return {
        explain: explain,
        handleExplainAnswer: handleExplainAnswer,
    };
}