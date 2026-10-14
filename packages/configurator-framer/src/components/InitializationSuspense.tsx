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

const neverResolves = new Promise<never>(() => {});

// Hands the suspension on to Framer's root instead of committing a fallback, see docs/adr/0002-suspense-inside-framer-content.md.
function PassSuspensionToParent(): never {
    throw neverResolves;
}
