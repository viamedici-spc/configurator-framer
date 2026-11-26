// NOTE: The declaration below was injected by `"framer"`
// see https://www.framer.com/docs/guides/handshake for more information.
declare module "https://framer.com/m/*";

// use-debounce 8 ships its types only under the "node" and "browser" export conditions, which the "bundler" resolution
// does not pick. This repeats the part of its declarations (dist/useDebouncedCallback.d.ts) that is used here.
declare module "use-debounce" {
    export interface ControlFunctions {
        cancel: () => void;
        flush: () => void;
        isPending: () => boolean;
    }

    export interface DebouncedState<T extends (...args: any[]) => ReturnType<T>> extends ControlFunctions {
        (...args: Parameters<T>): ReturnType<T> | undefined;
    }

    export function useDebouncedCallback<T extends (...args: any) => ReturnType<T>>(func: T, wait?: number, options?: {
        leading?: boolean;
        trailing?: boolean;
        maxWait?: number;
    }): DebouncedState<T>;
}
