import {createContext, PropsWithChildren, useContext} from "react";
import usePopover, {PopoverOptions} from "../../hooks/usePopover";

type ContextType = ReturnType<typeof usePopover>;

const PopoverContext = createContext<ContextType>(null);

export const usePopoverContext = () => {
    const context = useContext(PopoverContext);

    if (context == null) {
        throw new Error("Popover components must be wrapped in <Popover />");
    }

    return context;
};

export default function Popover({children, ...options}: PropsWithChildren<PopoverOptions>) {
    const popover = usePopover(options);

    return (
        <PopoverContext.Provider value={popover}>
            {children}
        </PopoverContext.Provider>
    );
}