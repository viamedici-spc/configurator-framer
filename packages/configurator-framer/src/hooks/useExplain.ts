import {ExplainContext, explainContext} from "../common/explain";
import {useContext} from "react";

export type UseExplainResult = {
    explain: ExplainContext["explain"],
    handleExplainAnswer: ExplainContext["handleExplainAnswer"]
};

export default function useExplain(): UseExplainResult {
    const {explain, handleExplainAnswer} = useContext(explainContext);

    return {
        explain: explain,
        handleExplainAnswer: handleExplainAnswer
    };
}