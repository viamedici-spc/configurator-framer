import {CausedByDecision, ExplicitDecision} from "@viamedici-spc/configurator-ts";
import styled from "styled-components";
import {faMinus, faPlus} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import getDecisionStateDisplayName from "./getDecisionStateDisplayName";

const Root = styled.div`
    display: flex;
    gap: var(--space-xs);
    align-items: center;
    background-color: var(--color-explain-attribute-value-fill);
    border-radius: 360px;
    padding-right: var(--space-sm);
    font-size: 0.9em;
    font-family: var(--framer-font-family, "Inter", "Inter Placeholder", sans-serif);
    font-weight: 500;
    min-width: 0;
`

const Icon = styled.div`
    display: grid;
    place-content: center;
    border-top-left-radius: 360px;
    border-bottom-left-radius: 360px;
    height: 1.5em;
    width: 1.5em;
    flex-shrink: 0;

    &.mode-add {
        background-color: var(--color-explain-attribute-value-add-fill);
        color: var(--color-explain-attribute-value-add-color);
    }

    &.mode-remove {
        background-color: var(--color-explain-attribute-value-remove-fill);
        color: var(--color-explain-attribute-value-remove-color);
    }
`

const Name = styled.div`
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`

export type Decision = (CausedByDecision | ExplicitDecision) & {
    intention: "add" | "remove"
}

export function AttributeValue(props: { decision: Decision }) {
    const {decision} = props;
    const intention = decision.intention;
    const name = getDecisionStateDisplayName(decision);

    return (
        <Root>
            <Icon className={`mode-${intention}`}>
                {intention === "remove" && <FontAwesomeIcon icon={faMinus}/>}
                {intention === "add" && <FontAwesomeIcon icon={faPlus}/>}
            </Icon>
            <Name>
                {name}
            </Name>
        </Root>
    )
}
