import * as React from "react";

import {rebuildElement} from "./rebuild-element";
import {ChildrenFunc, traverseElementTree} from "./traverse-element-tree";

const {isValidElement} = React;

export type MatchFunc<S> = (value: React.ReactNode, state?: S) => boolean;

export type ReplacerFunc<V extends React.ReactNode, S> = (
    value: V,
    state?: S
) => React.ReactNode;

export type StateUpdateFunc<S> = (input: React.ReactNode, state?: S) => S;

type ReplacerSharedProps<StateType = any> = {
    replace: ReplacerFunc<any, StateType>;
    updateState?: StateUpdateFunc<StateType>;
    initialState?: StateType;
};

export type ReplacerProps<StateType = any> = ReplacerSharedProps<StateType> &
    (
        | {
        match: MatchFunc<StateType>;
    }
        | {
        matchElement: React.ComponentType | string;
    }
        | {
        matchLiteral: MatchFunc<StateType>;
    }
        );

export function replaceInTree<S = any>(
    node: React.ReactNode,
    args: ReplacerProps<S>
): React.ReactNode {
    let match: MatchFunc<S>;
    const {replace, updateState} = args;
    if ("matchElement" in args) {
        match = i => isValidElement(i) && i.type === args.matchElement;
    } else if ("matchLiteral" in args) {
        match = i =>
            !Array.isArray(i) && !isValidElement(i) && args.matchLiteral(i);
    } else {
        match = args.match;
    }
    return traverseElementTree(
        node,
        {
            visit(
                element: React.ReactNode,
                state: S,
                children: ChildrenFunc<React.ReactNode, S>
            ): React.ReactNode {
                const newState = updateState ? updateState(state as any) : state;
                const resolvedChildren = children ? children(newState) : undefined;
                const result = rebuildElement(element, resolvedChildren);
                if (match(result, newState)) {
                    return replace(result, newState);
                } else {
                    return result;
                }
            }
        },
        args.initialState
    );
}