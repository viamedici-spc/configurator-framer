/**
 * Framework-agnostic store that exposes the custom parameters passed in from the host page.
 *
 * Transport differs by embedding mode but is abstracted away here:
 *  - Native: the app's DOM is rendered inside the `spc-embedded-configurator-native` host
 *    element, which carries the parameters as `data-*` attributes. We read them directly and
 *    observe the element for changes.
 *  - Iframe: the app runs in a sandboxed iframe. We ask the host for the current parameters via
 *    postMessage and listen for pushed updates.
 *
 * The constants below mirror `@viamedici-spc/configurator-framer-host` (`src/parameters.ts`).
 * The two packages have no shared module, so keep them in sync.
 */

export const NATIVE_HOST_TAG = "spc-embedded-configurator-native";
export const PARAM_ATTRIBUTE_PREFIX = "data-";
export const MSG_PARAMETERS = "spc.configurator.parameters";
export const MSG_PARAMETERS_REQUEST = "spc.configurator.parameters.request";

export type HostParameters = Record<string, string>;

export type HostParametersStore = {
    subscribe: (onStoreChange: () => void) => () => void;
    getSnapshot: () => HostParameters;
    getServerSnapshot: () => HostParameters;
};

export const EMPTY_PARAMS: HostParameters = Object.freeze({});

export const emptyStore: HostParametersStore = {
    subscribe: () => () => {
    },
    getSnapshot: () => EMPTY_PARAMS,
    getServerSnapshot: () => EMPTY_PARAMS,
};

export function shallowEqualParameters(a: HostParameters, b: HostParameters): boolean {
    if (a === b) {
        return true;
    }
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);
    if (aKeys.length !== bKeys.length) {
        return false;
    }
    for (const key of aKeys) {
        if (!Object.prototype.hasOwnProperty.call(b, key) || a[key] !== b[key]) {
            return false;
        }
    }
    return true;
}

function readParametersFromElement(element: Element): HostParameters {
    const result: Record<string, string> = {};
    for (const attr of Array.from(element.attributes)) {
        if (attr.name.startsWith(PARAM_ATTRIBUTE_PREFIX) && attr.name.length > PARAM_ATTRIBUTE_PREFIX.length) {
            result[attr.name.slice(PARAM_ATTRIBUTE_PREFIX.length)] = attr.value;
        }
    }
    return result;
}

function coerceParameters(value: unknown): HostParameters {
    if (typeof value !== "object" || value === null) {
        return EMPTY_PARAMS;
    }
    const result: Record<string, string> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
        result[key] = String(val);
    }
    return result;
}

export function createHostParametersStore(anchorEl: Element): HostParametersStore {
    let current: HostParameters = EMPTY_PARAMS;
    const listeners = new Set<() => void>();

    const commit = (next: HostParameters) => {
        if (!shallowEqualParameters(current, next)) {
            // Only replace the reference on a real change so getSnapshot stays stable
            // between renders (required by useSyncExternalStore).
            current = next;
            listeners.forEach(listener => listener());
        }
    };

    const hostElement = typeof anchorEl.closest === "function"
        ? anchorEl.closest(NATIVE_HOST_TAG)
        : null;

    // Seed synchronously (no listeners yet → no notification) so getSnapshot is correct from the
    // first render. subscribe later reconciles any change that happened in the meantime.
    if (hostElement) {
        current = readParametersFromElement(hostElement);
    }

    const subscribe = (onStoreChange: () => void): (() => void) => {
        listeners.add(onStoreChange);

        // --- Native mode ---
        if (hostElement) {
            commit(readParametersFromElement(hostElement));
            const observer = new MutationObserver(() => commit(readParametersFromElement(hostElement)));
            observer.observe(hostElement, {attributes: true});
            return () => {
                listeners.delete(onStoreChange);
                if (listeners.size === 0) {
                    observer.disconnect();
                }
            };
        }

        // --- Iframe mode ---
        if (typeof window === "undefined") {
            return () => {
                listeners.delete(onStoreChange);
            };
        }
        const onMessage = (event: MessageEvent) => {
            if (event.source !== window.parent) {
                return;
            }
            const data = event.data;
            if (typeof data !== "object" || data === null || data.type !== MSG_PARAMETERS) {
                return;
            }
            commit(coerceParameters(data.parameters));
        };
        window.addEventListener("message", onMessage);
        // Ask the host for the current parameters. Done after attaching the listener so the
        // reply can never race ahead of it. The host also pushes future updates on its own.
        try {
            window.parent.postMessage({type: MSG_PARAMETERS_REQUEST}, "*");
        } catch {
            // ignore — e.g. cross-origin restrictions on window.parent
        }
        return () => {
            window.removeEventListener("message", onMessage);
            listeners.delete(onStoreChange);
        };
    };

    return {
        subscribe,
        getSnapshot: () => current,
        getServerSnapshot: () => EMPTY_PARAMS,
    };
}
