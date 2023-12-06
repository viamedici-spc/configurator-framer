import {useCallback, useEffect, useRef} from "react";
import {useDebouncedCallback} from "use-debounce";
import {useForceUpdate} from "framer-motion";

export default function useDebounceValue<TValue>(sourceValue: TValue, setSourceValue: (value: TValue) => void, inputValue: TValue, setInputValue: (value: TValue) => void, wait: number = 1000) {
    const [forceUpdate] = useForceUpdate();
    const debounced = useDebouncedCallback(v => {
        setSourceValue(v);
        forceUpdate();
    }, wait);
    const lastInputValue = useRef(inputValue);
    const lastSourceValue = useRef(sourceValue);
    const isDebouncePending = debounced.isPending();
    const lastDebouncedIsPending = useRef(isDebouncePending);

    useEffect(() => {
        if (sourceValue !== lastSourceValue.current) {
            lastSourceValue.current = sourceValue;

            if (isDebouncePending) {
                debounced.cancel();
                forceUpdate();
            }

            if (sourceValue !== inputValue) {
                setInputValue(sourceValue);
            }
        }

        if (inputValue !== lastInputValue.current) {
            lastInputValue.current = inputValue;
            if (inputValue !== sourceValue) {
                debounced(inputValue);
                forceUpdate();
            } else if (isDebouncePending) {
                // The original inputValue before debouncing was set by user -> noop
                debounced.cancel();
                forceUpdate();
            }
        }

        if (isDebouncePending !== lastDebouncedIsPending.current) {
            lastDebouncedIsPending.current = isDebouncePending;
            if (!isDebouncePending && sourceValue !== inputValue) {
                // Reset the inputValue to the sourceValue because the inputValue wasn't applied by setInputValue.
                // Otherwise, the inputValue and sourceValue would be not in sync anymore after debouncing.
                setInputValue(sourceValue);
            }
        }
    }, [sourceValue, inputValue, debounced, isDebouncePending]);

    const flush = useCallback(() => {
        if (debounced.isPending()) {
            debounced.flush();
            // forceUpdate();
        }
    }, [debounced]);

    // Flush on unmount
    useEffect(() => () => flush(), [flush]);

    return {
        flush
    };
}