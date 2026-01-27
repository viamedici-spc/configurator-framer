import useExplainProcess from "../../../../hooks/useExplainProcess";
import {match} from "ts-pattern";
import {ComponentDecisionState, ExplainQuestionSubject, ExplainQuestionType} from "@viamedici-spc/configurator-ts";
import styled from "styled-components";
import {HTMLProps, ReactNode} from "react";
import {useAttributeName, useChoiceValueNames} from "../../../../hooks/localization";
import useCommonExplainProps from "../../../../props/useCommonExplainProps";
import {getTextStyle} from "../../../../props/textProps";

const Value = styled.span`
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
`

export default function ExplainHeader(props: HTMLProps<HTMLDivElement>) {
    const {explainQuestion} = useExplainProcess();
    const {header, attributeValue} = useCommonExplainProps();

    if (!explainQuestion) {
        // This occurs by a setMany conflict
        return (
            <div {...props}>
                {header.subject.generalConflictTitle}
            </div>
        )
    }

    const subjectName = match(explainQuestion)
        .returnType<ReactNode>()
        .with({subject: ExplainQuestionSubject.configuration}, () => header.subject.configurationSubjectTitle)
        .with({subject: ExplainQuestionSubject.attribute}, q => useAttributeName(q.attributeId) ?? q.attributeId.localId)
        .with({subject: ExplainQuestionSubject.choiceValue}, q => useChoiceValueNames(q.attributeId).get(q.choiceValueId) ?? q.choiceValueId)
        .with({subject: ExplainQuestionSubject.component, state: ComponentDecisionState.Included}, () => attributeValue.componentDecisionStateIncludedLabel)
        .with({subject: ExplainQuestionSubject.component, state: ComponentDecisionState.Excluded}, () => attributeValue.componentDecisionStateExcludedLabel)
        .with({subject: ExplainQuestionSubject.boolean, state: true}, () => attributeValue.booleanDecisionStateTrueLabel)
        .with({subject: ExplainQuestionSubject.boolean, state: false}, () => attributeValue.booleanDecisionStateFalseLabel)
        .with({subject: ExplainQuestionSubject.numeric}, q => q.state.toString())
        .exhaustive()

    const question = match(explainQuestion)
        .returnType<ReactNode>()
        .with({question: ExplainQuestionType.whyIsStateNotPossible}, () => header.suffix.isBlockedSuffix)
        .with({question: ExplainQuestionType.whyIsNotSatisfied}, () => header.suffix.isNotSatisfiedSuffix)
        .exhaustive()

    return <div {...props} style={getTextStyle(header.suffix)}><Value style={getTextStyle(header.subject)}>{subjectName}</Value>&nbsp;{question}</div>
}