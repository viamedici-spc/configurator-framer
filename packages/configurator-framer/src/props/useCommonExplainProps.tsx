import {CommonExplainProps} from "./commonExplainProps";
import {useContext} from "react";
import {explainPopoverPropsContext} from "./explainPopoverProps";
import {explainDialogPropsContext} from "./explainDialogProps";

const useCommonExplainProps = (): CommonExplainProps => useContext(explainPopoverPropsContext) || useContext(explainDialogPropsContext);

export default useCommonExplainProps