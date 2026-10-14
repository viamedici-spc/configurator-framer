import {PropsWithChildren, Suspense} from "react";
import {useConfigurationInitialization} from "@viamedici-spc/configurator-react";

export default function InitializationSuspense({children}: PropsWithChildren) {
    const {isInitializing} = useConfigurationInitialization();

    return (
        <Suspense fallback={isInitializing ? null : <PassSuspensionToParent/>}>
            {children}
        </Suspense>
    );
}

const retryDelayMs = 100;
let pendingRetry: Promise<void> | null = null;

// Hands the suspension on to Framer's root instead of committing a fallback, see docs/adr/0002-suspense-inside-framer-content.md.
// The promise resolves after a short delay, so a regular boundary above that catches it retries instead of waiting forever.
function PassSuspensionToParent(): never {
    pendingRetry ??= new Promise<void>(resolve => setTimeout(() => {
        pendingRetry = null;
        resolve();
    }, retryDelayMs));
    throw pendingRetry;
}
