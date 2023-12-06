import useExplainProcess from "../../../hooks/useExplainProcess";
import {match} from "ts-pattern";
import {HTMLProps, ReactNode} from "react";
import {ExplainQuestionSubject, ExplainQuestionType} from "@viamedici-spc/configurator-ts";

type Variant = 'failedToExplain' | 'noExplanationFound' | 'noSolutionFound';

export default function InfoMessage(props: HTMLProps<HTMLDivElement> & { variant: Variant }) {
    const {variant, ...restProps} = props;
    const {explainQuestion} = useExplainProcess();

    const question = match(explainQuestion)
        .returnType<ReactNode>()
        .with({question: ExplainQuestionType.whyIsStateNotPossible}, () => "why your selection is not possible")
        .with({question: ExplainQuestionType.whyIsNotSatisfied, subject: ExplainQuestionSubject.configuration}, () => "why your configuration is not satisfied")
        .with({question: ExplainQuestionType.whyIsNotSatisfied, subject: ExplainQuestionSubject.attribute}, () => "why your attribute is not satisfied")
        .exhaustive()

    const content = match(variant)
        .returnType<ReactNode>()
        .with("failedToExplain", () => (
            <>
                Failed to explain {question}.<br/>
                Please check your internet connection and try again.
            </>
        ))
        .with("noExplanationFound", () => <>There was no explanation found for {question}.</>)
        .with("noSolutionFound", () => <>There was no solution found for {question}.</>)
        .exhaustive();

    return (
        <div {...restProps}>
            {content}
        </div>
    )
}