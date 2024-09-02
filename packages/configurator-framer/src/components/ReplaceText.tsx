import {cloneElement, ReactElement} from "react";
import withErrorBoundary from "../common/withErrorBoundary";
import {Replacer} from "../common/react-element-replace/Replacer";
import normalizePropName from "../common/normalizePropName";
import {ReplaceTextProps} from "../props/replaceTextProps";

type Props = ReplaceTextProps & {
    text: string
}

const ReplaceText = withErrorBoundary((props: Props) => {
    const {children, mode, replaceString, propName, elementName, text} = props;

    if (mode === "replace") {
        return (
            <Replacer match={n => typeof n === "string"}
                      replace={s => s === replaceString ? text : s}>
                {children}
            </Replacer>
        )
    } else if (mode === "set-prop") {
        return (
            <Replacer match={(e: ReactElement) => (e.type as any)?.displayName === elementName}
                      replace={(element: ReactElement) => cloneElement(element, {[normalizePropName(propName)]: text})}>
                {children}
            </Replacer>
        )
    }
    return children
})

export default ReplaceText;