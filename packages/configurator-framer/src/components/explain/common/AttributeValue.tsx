import {CausedByDecision, ExplicitDecision} from "@viamedici-spc/configurator-ts";
import styled from "styled-components";
import {faMinus, faPlus} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import getDecisionStateDisplayName from "./getDecisionStateDisplayName";
import {ChoiceValueNames} from "../../../hooks/localization";
import useCommonExplainProps from "../../../props/useCommonExplainProps";
import {getPaddingStyle} from "../../../props/paddingProps";
import {match} from "ts-pattern";
import {getTextStyle} from "../../../props/textProps";
import {getBorderStyle} from "../../../props/borderProps";

const Root = styled.div`
    display: flex;
    gap: var(--space-xs);
    align-items: center;
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
`

const Name = styled.div`
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`

export type Decision = (CausedByDecision | ExplicitDecision) & {
    intention: "add" | "remove"
}

export function AttributeValue(props: { decision: Decision, choiceValuesNames: ChoiceValueNames }) {
    const {decision, choiceValuesNames} = props;
    const intention = decision.intention;
    const commonExplainProps = useCommonExplainProps();
    const name = getDecisionStateDisplayName(decision, choiceValuesNames, commonExplainProps);
    const indentProps = match(intention)
        .with("remove", () => commonExplainProps.attributeValue.remove)
        .with("add", () => commonExplainProps.attributeValue.add)
        .exhaustive();

    return (
        <Root style={{
            ...getPaddingStyle(commonExplainProps.attributeValue),
            ...getTextStyle(indentProps),
            ...getBorderStyle(indentProps),
            backgroundColor: indentProps.fill
        }}>
            <Icon style={{backgroundColor: indentProps.iconFill, color: indentProps.iconColor}}>
                {intention === "remove" && <FontAwesomeIcon icon={faMinus}/>}
                {intention === "add" && <FontAwesomeIcon icon={faPlus}/>}
            </Icon>
            <Name>
                {name}
            </Name>
        </Root>
    )
}
