import type {CommonExplainProps} from "./explain/commonExplainProps";
import {useContext} from "react";
import {explainPopoverPropsContext} from "./explain/explainPopoverProps";
import {explainDialogPropsContext} from "./explain/explainDialogProps";

const useCommonExplainProps = (): CommonExplainProps => {
    const props = useContext(explainPopoverPropsContext) || useContext(explainDialogPropsContext);

    if (props == null) {
        throw new Error("This component must be wrapped in <Configuration />");
    }

    return props;
};

export default useCommonExplainProps