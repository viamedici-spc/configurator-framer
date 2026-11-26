import type {Context} from "react";
import {useContext} from "react";

/**
 * Reads a context whose provider always wraps the calling component, e.g. one set up by <Configuration />.
 * Fails with a clear error if the provider is missing.
 */
export default function useRequiredContext<T>(context: Context<T | null>, providerName: string): T {
    const value = useContext(context);

    if (value == null) {
        throw new Error(`This component must be wrapped in <${providerName} />`);
    }

    return value;
}