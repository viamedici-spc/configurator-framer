import type {ExplainContext} from "../common/explain";
import { explainContext} from "../common/explain";
import useRequiredContext from "../common/useRequiredContext";

export type UseExplainResult = {
    explain: ExplainContext["explain"],
    handleExplainAnswer: ExplainContext["handleExplainAnswer"]
};

export default function useExplain(): UseExplainResult {
    const {explain, handleExplainAnswer} = useRequiredContext(explainContext, "Configuration");

    return {
        explain: explain,
        handleExplainAnswer: handleExplainAnswer
    };
}