import * as React from "react";

import type { ReplacerProps} from "./replace-in-tree";
import { replaceInTree } from "./replace-in-tree";

function Replacer<StateType = any>(
    props: React.PropsWithChildren<ReplacerProps<StateType>>
): React.ReactElement {
    return <>{replaceInTree(props.children, props)}</>;
}

export { Replacer };