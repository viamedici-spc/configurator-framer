import * as React from "react";
import {PropsWithChildren} from "react";
import useDialog, {DialogOptions} from "../../hooks/useDialog";

type ContextType = ReturnType<typeof useDialog>;

const DialogContext = React.createContext<ContextType>(null);

export const useDialogContext = () => {
    const context = React.useContext(DialogContext);

    if (context == null) {
        throw new Error("Dialog components must be wrapped in <Dialog />");
    }

    return context;
};

export default function Dialog({children, ...options}: PropsWithChildren<DialogOptions>) {
    const dialog = useDialog(options);

    return (
        <DialogContext.Provider value={dialog}>
            {children}
        </DialogContext.Provider>
    );
}

