import {createContext, PropsWithChildren, useContext, useMemo, useState, useSyncExternalStore} from "react";
import withErrorBoundary from "../common/withErrorBoundary";
import useRenderPlaceholder from "../hooks/useRenderPlaceholder";
import {createHostParametersStore, emptyStore} from "../common/hostParametersStore";
import {hostParametersContext} from "../hooks/useHostParameters";

/**
 * True when a `HostParametersProvider` is already mounted above. Lets the provider stay idempotent
 * under nesting: the outermost provider owns the single store, inner ones become pass-throughs that
 * inherit the existing context. This keeps exactly one transport (observer / message listener /
 * handshake) regardless of how often the provider is nested.
 */
const hostParametersPresenceContext = createContext(false);

/**
 * Provides the custom parameters passed in from the host page to descendant components via
 * {@link useHostParameters} / {@link useHostParameter}. Works transparently for both native and
 * iframe embedding. Safe to nest (the outermost provider owns the store) and safe outside any host
 * (empty set).
 *
 * `Configuration` already wraps its subtree with this provider, so components inside the
 * configurator can read parameters without any setup. Place it as an outer wrapper on the canvas
 * when a parameter must be available above `Configuration` (e.g. to drive `deploymentName`); the
 * inner provider then yields to the outer one, so there is still only a single store.
 */
const HostParametersProvider = withErrorBoundary((props: PropsWithChildren) => {
    const renderPlaceholder = useRenderPlaceholder();
    const alreadyProvided = useContext(hostParametersPresenceContext);

    // No host parameters at design time; nothing to add when a provider already exists above.
    if (renderPlaceholder || alreadyProvided) {
        return <>{props.children}</>;
    }

    return <RuntimeHostParametersProvider>{props.children}</RuntimeHostParametersProvider>;
});

function RuntimeHostParametersProvider(props: PropsWithChildren) {
    const [anchor, setAnchor] = useState<HTMLElement | null>(null);
    const store = useMemo(() => (anchor ? createHostParametersStore(anchor) : emptyStore), [anchor]);
    const parameters = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);

    return (
        <>
            <div ref={setAnchor} style={{display: "contents"}}/>
            <hostParametersPresenceContext.Provider value={true}>
                <hostParametersContext.Provider value={parameters}>
                    {props.children}
                </hostParametersContext.Provider>
            </hostParametersPresenceContext.Provider>
        </>
    );
}

export default HostParametersProvider;
