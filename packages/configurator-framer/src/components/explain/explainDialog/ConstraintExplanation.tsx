import {ConstraintExplanation} from "@viamedici-spc/configurator-ts";
import styled from "styled-components";
import {pipe, RA, RNEA, RR, Str} from "@viamedici-spc/fp-ts-extensions";
import ExplanationCard from "./ExplanationCard";

const Root = styled(ExplanationCard)`
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

const Item = styled.li`
    font-size: 0.9em;
    font-family: var(--framer-font-family, "Inter", "Inter Placeholder", sans-serif);
    font-weight: 500;
`

export default function ConstraintExplanation(props: { explanation: ConstraintExplanation }) {
    const {explanation} = props;
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
        <Root>
            <List>
                {causedByRules.map(r => (
                    <li>
                        <span>{r.configurationModelId}</span>
                        <SubList>
                            {r.rules.map(ruleId => <Item>{ruleId}</Item>)}
                        </SubList>
                    </li>
                ))}

                {causedByCardinalities.length > 0 && (
                    <li>
                        <span>Cardinality</span>
                        <SubList>
                            {causedByCardinalities.map(c => <Item>{c.localId}</Item>)}
                        </SubList>
                    </li>
                )}
            </List>
        </Root>
    )
}