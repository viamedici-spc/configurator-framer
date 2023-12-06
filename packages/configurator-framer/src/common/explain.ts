import {createContext} from "react";
import {DecisionExplanation, DecisionsExplainAnswer, ExplainQuestionParam, ExplainQuestion, ConstraintExplanation} from "@viamedici-spc/configurator-ts";
import {UseExplainResult} from "@viamedici-spc/configurator-react";

export type DisplayMode = "dialog" | "popover";

export type ExplainProcess = {
    /**
     * Is Null if the explanation process is not the result of an ExplainQuestion.
     */
    explainQuestion: ExplainQuestion | null,
    displayMode: DisplayMode,
    /**
     * Is Null if no controlId was provided.
     */
    controlId: string | null,
    hasError: boolean,
    /**
     * Is Null in case of an error.
     */
    decisionExplanations: ReadonlyArray<DecisionExplanation> | null,
    /**
     * Is Null in case of an error.
     */
    constraintExplanations: ReadonlyArray<ConstraintExplanation> | null,
};

export type ExplainContext = {
    switchMode: (displayMode: DisplayMode) => void,
    explain: (question: ExplainQuestionParam, displayMode: DisplayMode, controlId?: string) => Promise<void>,
    handleExplainAnswer: (explainAnswer: DecisionsExplainAnswer, displayMode: DisplayMode, controlId?: string) => Promise<void>,
    applySolution: UseExplainResult["applySolution"],
    dismiss: () => void,
    /**
     * Is Null if there is no ongoing explain process.
     */
    process: ExplainProcess | null,
};

export const explainContext = createContext<ExplainContext>(null);