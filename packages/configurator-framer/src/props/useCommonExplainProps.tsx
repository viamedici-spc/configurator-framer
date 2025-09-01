import {CommonExplainProps} from "./explain/commonExplainProps";
import {useContext} from "react";
import {explainPopoverPropsContext} from "./explain/explainPopoverProps";
import {explainDialogPropsContext} from "./explain/explainDialogProps";

const useCommonExplainProps = (): CommonExplainProps => useContext(explainPopoverPropsContext) || useContext(explainDialogPropsContext);

export default useCommonExplainProps