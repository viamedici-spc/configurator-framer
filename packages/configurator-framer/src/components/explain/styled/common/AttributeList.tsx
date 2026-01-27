import Attribute from "./Attribute";
import {HTMLProps} from "react";
import {ExplainAttribute} from "../../common/explainAttributes";

type Props = HTMLProps<HTMLDivElement> & {
    attributes: ReadonlyArray<ExplainAttribute>
}
export default function AttributeList(props: Props) {
    const {attributes, ...restProps} = props;

    return (
        <div {...restProps}>
            {attributes.map(a => <Attribute key={a.key} decisions={a.decisions}/>)}
        </div>
    )
}
