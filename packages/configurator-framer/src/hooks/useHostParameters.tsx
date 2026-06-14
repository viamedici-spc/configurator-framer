import {createContext, useContext} from "react";
import {EMPTY_PARAMS, HostParameters} from "../common/hostParametersStore";

/**
 * Holds the custom parameters passed in from the host page. Defaults to an empty set so the
 * hooks are safe to call without a {@link HostParametersProvider} (e.g. when the configurator
 * runs standalone outside an embedding host).
 */
export const hostParametersContext = createContext<HostParameters>(EMPTY_PARAMS);

/** All host parameters as a string→string dictionary. Re-renders on change (shallow compare). */
export function useHostParameters(): HostParameters {
    return useContext(hostParametersContext);
}

/** A single host parameter by key, or `undefined` if not set. */
export function useHostParameter(key: string): string | undefined {
    return useContext(hostParametersContext)[key];
}
