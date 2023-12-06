import {PropsWithChildren, useContext, useState} from "react";
import {explainContext} from "../../../common/explain";

export default function FreezeExplainContext(props: PropsWithChildren) {
    const context = useContext(explainContext);
    const [capturedExplainContext, _] = useState(context);

    return (
        <explainContext.Provider value={capturedExplainContext}>
            {props.children}
        </explainContext.Provider>
    )
}