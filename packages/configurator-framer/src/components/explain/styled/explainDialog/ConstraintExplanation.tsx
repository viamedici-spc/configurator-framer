import {ConstraintExplanation} from "@viamedici-spc/configurator-ts";
import styled from "styled-components";
import {pipe, RA, RNEA, RR, Str} from "@viamedici-spc/fp-ts-extensions";
import {getBoxStyle} from "../../../../props/boxProps";
import {getMarginStyle} from "../../../../props/marginProps";
import {useExplainDialogProps} from "../../../../props/explain/explainDialogProps";
import {getTextStyle} from "../../../../props/textProps";

const Root = styled.div`
    ul {
        margin: 0;
    }

    line-height: 1.5em;
`

const List = styled.ul`
    list-style-type: none;
    margin-inline-start: 0;
    padding-inline-start: 0;
`

const SubList = styled.ul`
    list-style-type: disc;
    margin-inline-start: 0;
    padding-inline-start: var(--space-lg);
`

export default function ConstraintExplanation(props: { explanation: ConstraintExplanation }) {
    const {explanation} = props;
    const {explanationCard, constraintExplanation} = useExplainDialogProps();
    const causedByCardinalities = explanation.causedByCardinalities;
    const causedByRules = pipe(
        explanation.causedByRules,
        RNEA.groupBy(d => d.configurationModelId),
        RR.collect(Str.Ord)((k, v) => ({
            configurationModelId: k,
            rules: pipe(v, RA.map(r => r.localId), RA.sort(Str.Ord))
        }))
    );

    return (
        <Root style={{...getBoxStyle(explanationCard), ...getMarginStyle(explanationCard)}}>
            <List>
                {causedByRules.map(r => (
                    <li>
                        <span style={getTextStyle(constraintExplanation.configurationModelId)}>{r.configurationModelId}</span>
                        <SubList style={getTextStyle(constraintExplanation.ruleId)}>
                            {r.rules.map(ruleId => <li>{ruleId}</li>)}
                        </SubList>
                    </li>
                ))}

                {causedByCardinalities.length > 0 && (
                    <li style={getTextStyle(constraintExplanation.ruleId)}>
                        <span>Cardinality</span>
                        <SubList>
                            {causedByCardinalities.map(c => <li>{c.localId}</li>)}
                        </SubList>
                    </li>
                )}
            </List>
        </Root>
    )
}