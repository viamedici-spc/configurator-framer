import {PropsWithChildren, useCallback, useMemo, useRef, useState} from "react";
import {DisplayMode, ExplainContext, explainContext, ExplainProcess} from "../../common/explain";
import {useExplain, UseExplainResult} from "@viamedici-spc/configurator-react";
import {ConstraintsExplainAnswer, DecisionExplanation, DecisionsExplainAnswer, ExplainQuestion, explainQuestionBuilder, ExplainQuestionParam} from "@viamedici-spc/configurator-ts";
import {guid} from "dyna-guid";
import {Bool, Ord, pipe, RA, Num} from "@viamedici-spc/fp-ts-extensions";

type Props = {
    explainConstraints: boolean
}

export default function ExplainController(props: PropsWithChildren<Props>) {
    const [explainProcess, setExplainProcess] = useState<ExplainProcess>(null);
    const {explain, applySolution} = useExplain();
    const activePromiseRef = useRef<string>(null);

    const evaluatePromise = useCallback(async (lazyPromise: () => Promise<DecisionsExplainAnswer | ConstraintsExplainAnswer>, question: ExplainQuestion | null, displayMode: DisplayMode, controlId: string | null): Promise<void> => {
        const promiseRef = guid();
        activePromiseRef.current = promiseRef;
        setExplainProcess(null);
        try {
            const a = await lazyPromise();
            const da = a as DecisionsExplainAnswer;
            const ca = a as ConstraintsExplainAnswer;
            const decisionExplanations = da?.decisionExplanations ?? [];
            const constraintExplanations = ca?.constraintExplanations ?? [];
            if (promiseRef == activePromiseRef.current) {
                setExplainProcess({
                    controlId: controlId,
                    // Directly present as dialog if there are only constraint explanations, as the popover doesn't show them anyway.
                    displayMode: decisionExplanations.length === 0 && constraintExplanations.length > 0 ? "dialog" : displayMode,
                    explainQuestion: question,
                    hasError: false,
                    decisionExplanations: sortDecisionExplanations(decisionExplanations),
                    constraintExplanations: constraintExplanations
                });
            }
        } catch (e) {
            if (promiseRef == activePromiseRef.current) {
                setExplainProcess({
                    controlId: controlId,
                    displayMode: displayMode,
                    explainQuestion: question,
                    hasError: true,
                    decisionExplanations: null,
                    constraintExplanations: null
                });
            }
        }
    }, []);

    const explainFn = useCallback<ExplainContext["explain"]>((question: ExplainQuestionParam, displayMode: DisplayMode, controlId?: string) => {
        const explainQuestion = typeof question === "function" ? question(explainQuestionBuilder) : question;
        return evaluatePromise(() => props.explainConstraints
                ? explain(explainQuestion, "full")
                : explain(explainQuestion, "decisions"),
            explainQuestion, displayMode, controlId);
    }, [props.explainConstraints, explain, evaluatePromise]);

    const handleExplainAnswerFn = useCallback<ExplainContext["handleExplainAnswer"]>((explainAnswer: DecisionsExplainAnswer, displayMode: DisplayMode, controlId?: string) =>
            evaluatePromise(() => Promise.resolve(explainAnswer), null, displayMode, controlId),
        [evaluatePromise]);

    const dismiss = useCallback<ExplainContext["dismiss"]>(() => {
        setExplainProcess(null);
    }, []);

    const applySolutionFn = useCallback<UseExplainResult["applySolution"]>((solution) => {
        dismiss();
        return applySolution(solution);
    }, [applySolution, dismiss]);

    const switchMode = useCallback<ExplainContext["switchMode"]>((displayMode) => {
        setExplainProcess(e => e != null ? ({
            ...e,
            displayMode: displayMode
        }) : e);
    }, []);

    const contextValue = useMemo(() => ({
            process: explainProcess,
            applySolution: applySolutionFn,
            explain: explainFn,
            handleExplainAnswer: handleExplainAnswerFn,
            dismiss: dismiss,
            switchMode: switchMode
        } satisfies ExplainContext),
        [explainProcess, applySolutionFn, explainFn, handleExplainAnswerFn, dismiss, switchMode]);

    return (
        <explainContext.Provider value={contextValue}>
            {props.children}
        </explainContext.Provider>
    );
}

function sortDecisionExplanations(explanations: ReadonlyArray<DecisionExplanation>): ReadonlyArray<DecisionExplanation> {
    const explanationsWithSolutionsUp = pipe(
        Bool.Ord,
        Ord.contramap((e: DecisionExplanation) => e.solution == null)
    );
    const explanationsWithLessCausedByDecisionsUp = pipe(
        Num.Ord,
        Ord.contramap((e: DecisionExplanation) => e.causedByDecisions.length)
    );

    return pipe(
        explanations,
        RA.sortBy([explanationsWithSolutionsUp, explanationsWithLessCausedByDecisionsUp])
    );
}