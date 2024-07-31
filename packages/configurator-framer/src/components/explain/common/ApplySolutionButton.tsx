import {DecisionExplanation} from "@viamedici-spc/configurator-ts";
import useExplainProcess from "../../../hooks/useExplainProcess";
import {ButtonHTMLAttributes, DetailedHTMLProps} from "react";

type Props = DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & {
    explanation: DecisionExplanation
}

export default function ApplySolutionButton(props: Props) {
    const {explanation, ...restProps} = props;
    const process = useExplainProcess();

    return (
        <button {...restProps} onClick={() => process.applySolution(explanation.solution)}>
            {props.children}
        </button>
    )
}