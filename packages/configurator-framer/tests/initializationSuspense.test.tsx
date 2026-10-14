import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import {PropsWithChildren, Suspense} from "react";
import {createRoot, Root} from "react-dom/client";
import {act} from "react-dom/test-utils";
import InitializationSuspense from "../src/components/InitializationSuspense";

const initialization = vi.hoisted(() => {
    let isInitializing = true;
    const listeners = new Set<() => void>();
    return {
        get: () => isInitializing,
        set: (value: boolean) => {
            isInitializing = value;
            listeners.forEach(listener => listener());
        },
        subscribe: (listener: () => void) => {
            listeners.add(listener);
            return () => {
                listeners.delete(listener);
            };
        },
    };
});

vi.mock("@viamedici-spc/configurator-react", async () => {
    const {useSyncExternalStore} = await import("react");
    return {
        useConfigurationInitialization: () => ({
            isInitializing: useSyncExternalStore(initialization.subscribe, initialization.get),
        }),
    };
});

const neverResolves = new Promise<never>(() => {});

function ThrowForever(): never {
    throw neverResolves;
}

// Mirrors Framer's code component boundary, which hands a suspension up instead of showing a fallback.
function FramerCodeBoundary({children}: PropsWithChildren) {
    return <Suspense fallback={<ThrowForever/>}>{children}</Suspense>;
}

function createLazyText(text: string) {
    let isLoaded = false;
    let resolve = () => {};
    const promise = new Promise<void>(r => {
        resolve = () => {
            isLoaded = true;
            r();
        };
    });

    function LazyText() {
        if (!isLoaded) {
            throw promise;
        }
        return <span>{text}</span>;
    }

    return {LazyText, load: () => resolve()};
}

describe("InitializationSuspense", () => {
    let container: HTMLDivElement;
    let root: Root;

    beforeEach(() => {
        (globalThis as {IS_REACT_ACT_ENVIRONMENT?: boolean}).IS_REACT_ACT_ENVIRONMENT = true;
        container = document.createElement("div");
        document.body.appendChild(container);
        root = createRoot(container);
    });

    afterEach(() => {
        act(() => root.unmount());
        container.remove();
        initialization.set(true);
    });

    it("renders content handed up by a Framer boundary once it has loaded", async () => {
        initialization.set(false);
        const {LazyText, load} = createLazyText("Loaded");

        await act(async () => root.render(
            <InitializationSuspense>
                <FramerCodeBoundary>
                    <LazyText/>
                </FramerCodeBoundary>
            </InitializationSuspense>
        ));
        expect(container.textContent).toBe("");

        await act(async () => load());
        expect(container.textContent).toBe("Loaded");
    });

    it("keeps the current content visible while new content loads", async () => {
        initialization.set(false);
        const {LazyText, load} = createLazyText("Step 2");

        await act(async () => root.render(
            <InitializationSuspense>
                <span>Step 1</span>
            </InitializationSuspense>
        ));
        await act(async () => root.render(
            <InitializationSuspense>
                <span>Step 1</span>
                <FramerCodeBoundary>
                    <LazyText/>
                </FramerCodeBoundary>
            </InitializationSuspense>
        ));
        expect(container.innerHTML).toBe("<span>Step 1</span>");

        await act(async () => load());
        expect(container.textContent).toBe("Step 1Step 2");
    });

    it("renders content that loaded during initialization once initialization completes", async () => {
        const {LazyText, load} = createLazyText("Loaded");

        await act(async () => root.render(
            <InitializationSuspense>
                <FramerCodeBoundary>
                    <LazyText/>
                </FramerCodeBoundary>
            </InitializationSuspense>
        ));
        await act(async () => load());
        expect(container.textContent).toBe("");

        await act(async () => initialization.set(false));
        expect(container.textContent).toBe("Loaded");
    });

    it("retries when a regular boundary above catches the handed-on suspension", async () => {
        // After a suspension in a synchronous update, Framer turns its own boundaries into regular ones.
        initialization.set(false);
        const {LazyText, load} = createLazyText("Loaded");

        await act(async () => root.render(
            <Suspense fallback={<span>Regular fallback</span>}>
                <InitializationSuspense>
                    <LazyText/>
                </InitializationSuspense>
            </Suspense>
        ));
        expect(container.textContent).toBe("Regular fallback");

        await act(async () => {
            load();
            await new Promise(resolve => setTimeout(resolve, 250));
        });
        expect(container.textContent).toBe("Loaded");
    });
});
