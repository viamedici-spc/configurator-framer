import useExplainProcess from "../../../../hooks/useExplainProcess";
import {match, P} from "ts-pattern";
import {HTMLProps, ReactNode} from "react";
import {ExplainQuestionSubject, ExplainQuestionType} from "@viamedici-spc/configurator-ts";
import useCommonExplainProps from "../../../../props/useCommonExplainProps";
import {getTextStyle} from "../../../../props/textProps";
import Mustache from "mustache";

type Variant = 'failedToExplain' | 'noExplanationFound' | 'noSolutionFound';

export default function InfoMessage(props: HTMLProps<HTMLDivElement> & { variant: Variant }) {
    const {variant, ...restProps} = props;
    const {explainQuestion} = useExplainProcess();
    const {infoMessage} = useCommonExplainProps();

    const question = match(explainQuestion)
        .returnType<string>()
        .with({question: ExplainQuestionType.whyIsStateNotPossible}, () => infoMessage.whyIsStateNotPossibleQuestion)
        .with({question: ExplainQuestionType.whyIsNotSatisfied, subject: ExplainQuestionSubject.configuration}, () => infoMessage.whyConfigurationIsNotSatisfiedQuestion)
        .with({question: ExplainQuestionType.whyIsNotSatisfied, subject: ExplainQuestionSubject.attribute}, () => infoMessage.whyAttributeIsNotSatisfiedQuestion)
        .with(P.nullish, () => infoMessage.generalConflictQuestion)
        .exhaustive()

    const content = match(variant)
        .returnType<ReactNode>()
        .with("failedToExplain", () => (
            <>
                {Mustache.render(infoMessage.failedToExplainText, {question})}<br/>
                {infoMessage.failedToExplainHintText}
            </>
        ))
        .with("noExplanationFound", () => <>{Mustache.render(infoMessage.noExplanationFoundText, {question})}</>)
        .with("noSolutionFound", () => <>{Mustache.render(infoMessage.noSolutionFoundText, {question})}</>)
        .exhaustive();

    return (
        <div {...restProps} style={getTextStyle(infoMessage)}>
            {content}
        </div>
    )
}