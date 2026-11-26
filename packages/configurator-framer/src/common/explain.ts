import {createContext} from "react";
import type {DecisionExplanation, DecisionsExplainAnswer, ExplainQuestionParam, ExplainQuestion, ConstraintExplanation} from "@viamedici-spc/configurator-ts";
import type {UseExplainResult} from "@viamedici-spc/configurator-react";

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
} & ({
    hasError: false,
    decisionExplanations: ReadonlyArray<DecisionExplanation>,
    constraintExplanations: ReadonlyArray<ConstraintExplanation>,
} | {
    hasError: true,
    /**
     * Is Null in case of an error.
     */
    decisionExplanations: null,
    /**
     * Is Null in case of an error.
     */
    constraintExplanations: null,
});

export type ExplainContext = {
    switchMode: (displayMode: DisplayMode) => void,
    explain: (question: ExplainQuestionParam, displayMode: DisplayMode, controlId?: string | null) => Promise<void>,
    handleExplainAnswer: (explainAnswer: DecisionsExplainAnswer, displayMode: DisplayMode, controlId?: string | null) => Promise<void>,
    applySolution: UseExplainResult["applySolution"],
    dismiss: () => void,
    /**
     * Is Null if there is no ongoing explain process.
     */
    process: ExplainProcess | null,
};

export const explainContext = createContext<ExplainContext | null>(null);