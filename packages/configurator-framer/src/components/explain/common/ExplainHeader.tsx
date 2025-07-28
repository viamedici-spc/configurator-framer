import useExplainProcess from "../../../hooks/useExplainProcess";
import {match} from "ts-pattern";
import {ComponentDecisionState, ExplainQuestionSubject, ExplainQuestionType} from "@viamedici-spc/configurator-ts";
import styled from "styled-components";
import {HTMLProps, ReactNode} from "react";
import {useAttributeName, useChoiceValueNames} from "../../../hooks/localization";
import useCommonExplainProps from "../../../props/useCommonExplainProps";

const Value = styled.span`
    color: var(--color-explain-header-value-color);
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
`

export default function ExplainHeader(props: HTMLProps<HTMLDivElement>) {
    const {explainQuestion} = useExplainProcess();
    const {
        configurationSubjectTitle, componentDecisionStateIncludedLabel, componentDecisionStateExcludedLabel,
        booleanDecisionStateFalseLabel, booleanDecisionStateTrueLabel, isBlockedSuffix, isNotSatisfiedSuffix,
        generalConflictTitle
    } = useCommonExplainProps();

    if (!explainQuestion) {
        // This occurs by a setMany conflict
        return (
            <div {...props}>
                {generalConflictTitle}
            </div>
        )
    }

    const subjectName = match(explainQuestion)
        .returnType<ReactNode>()
        .with({subject: ExplainQuestionSubject.configuration}, () => configurationSubjectTitle)
        .with({subject: ExplainQuestionSubject.attribute}, q => useAttributeName(q.attributeId) ?? q.attributeId.localId)
        .with({subject: ExplainQuestionSubject.choiceValue}, q => useChoiceValueNames(q.attributeId).get(q.choiceValueId) ?? q.choiceValueId)
        .with({subject: ExplainQuestionSubject.component, state: ComponentDecisionState.Included}, () => componentDecisionStateIncludedLabel)
        .with({subject: ExplainQuestionSubject.component, state: ComponentDecisionState.Excluded}, () => componentDecisionStateExcludedLabel)
        .with({subject: ExplainQuestionSubject.boolean, state: true}, () => booleanDecisionStateTrueLabel)
        .with({subject: ExplainQuestionSubject.boolean, state: false}, () => booleanDecisionStateFalseLabel)
        .with({subject: ExplainQuestionSubject.numeric}, q => q.state.toString())
        .exhaustive()

    const question = match(explainQuestion)
        .returnType<ReactNode>()
        .with({question: ExplainQuestionType.whyIsStateNotPossible}, () => isBlockedSuffix)
        .with({question: ExplainQuestionType.whyIsNotSatisfied}, () => isNotSatisfiedSuffix)
        .exhaustive()

    return <div {...props}><Value>{subjectName}</Value>&nbsp;{question}</div>
}