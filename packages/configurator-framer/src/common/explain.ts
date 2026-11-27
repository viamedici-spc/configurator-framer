import {createContext} from "react";
import type {
    DecisionExplanation,
    DecisionsExplainAnswer,
    ExplainQuestionParam,
    ExplainQuestion,
    ConstraintExplanation,
} from "@viamedici-spc/configurator-ts";
import type {UseExplainResult} from "@viamedici-spc/configurator-react";

export type DisplayMode = "dialog" | "popover";

export type ExplainProcess = {
    /**
     * Is Null if the explanation process is not the result of an ExplainQuestion.
     */
    readonly explainQuestion: ExplainQuestion | null;
    readonly displayMode: DisplayMode;
    /**
     * Is Null if no controlId was provided.
     */
    readonly controlId: string | null;
} & (
    | {
          readonly hasError: false;
          readonly decisionExplanations: ReadonlyArray<DecisionExplanation>;
          readonly constraintExplanations: ReadonlyArray<ConstraintExplanation>;
      }
    | {
          readonly hasError: true;
          /**
           * Is Null in case of an error.
           */
          readonly decisionExplanations: null;
          /**
           * Is Null in case of an error.
           */
          readonly constraintExplanations: null;
      }
);

export type ExplainContext = {
    switchMode: (displayMode: DisplayMode) => void;
    explain: (question: ExplainQuestionParam, displayMode: DisplayMode, controlId?: string | null) => Promise<void>;
    handleExplainAnswer: (
        explainAnswer: DecisionsExplainAnswer,
        displayMode: DisplayMode,
        controlId?: string | null,
    ) => Promise<void>;
    applySolution: UseExplainResult["applySolution"];
    dismiss: () => void;
    /**
     * Is Null if there is no ongoing explain process.
     */
    process: ExplainProcess | null;
};

export const explainContext = createContext<ExplainContext | null>(null);