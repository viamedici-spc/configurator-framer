import useExplainProcess from "../../../hooks/useExplainProcess";
import {match} from "ts-pattern";
import {ExplainQuestionSubject, ExplainQuestionType} from "@viamedici-spc/configurator-ts";
import styled from "styled-components";
import {HTMLProps, ReactNode} from "react";

const Value = styled.span`
    color: var(--color-explain-header-value-color);
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
`

export default function ExplainHeader(props: HTMLProps<HTMLDivElement>) {
    const {explainQuestion} = useExplainProcess();

    if (!explainQuestion) {
        // This occurs by a setMany conflict
        return (
            <div {...props}>
                Conflict
            </div>
        )
    }

    const subjectName = match(explainQuestion)
        .returnType<ReactNode>()
        .with({subject: ExplainQuestionSubject.configuration}, () => "Configuration")
        .with({subject: ExplainQuestionSubject.attribute}, q => q.attributeId.localId)
        .with({subject: ExplainQuestionSubject.choiceValue}, q => q.choiceValueId)
        .with({subject: ExplainQuestionSubject.component}, q => q.state.toString())
        .with({subject: ExplainQuestionSubject.boolean}, q => q.state.toString())
        .with({subject: ExplainQuestionSubject.numeric}, q => q.state.toString())
        .exhaustive()

    const question = match(explainQuestion)
        .returnType<ReactNode>()
        .with({question: ExplainQuestionType.whyIsStateNotPossible}, () => "is blocked")
        .with({question: ExplainQuestionType.whyIsNotSatisfied}, () => "is not satisfied")
        .exhaustive()

    return <div {...props}><Value>{subjectName}</Value>&nbsp;{question}</div>
}