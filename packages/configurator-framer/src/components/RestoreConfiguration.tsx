import {addPropertyControls, ControlType, PropertyControls} from "framer"
import {PropsWithChildren} from "react";
import cloneChildrenWithProps from "../common/cloneChildrenWithProps";
import {useConfigurationStoring} from "@viamedici-spc/configurator-react";
import {AutomaticConflictResolution, ConfiguratorError, ConfiguratorErrorType, DecisionsExplainAnswer, ManualConflictResolution, DropExistingDecisionsMode, StoredConfiguration} from "@viamedici-spc/configurator-ts";
import {match} from "ts-pattern";
import {E, Either, left, O, Option, pipe, right, TaskEither, TE, TO} from "@viamedici-spc/fp-ts-extensions";
import {StoredConfigurationEnvelop} from "../common/StoredConfiguration";
import useRenderPlaceholder from "../hooks/useRenderPlaceholder";
import {explainableComponent} from "../common/componentComposites";
import {explainPropertyControls, ExplainProps} from "../props/explainProps";
import {useControlId} from "../common/controlId";
import useExplain from "../hooks/useExplain";

type Props = ExplainProps & {
    source: "file" | "clipboard"
    fileExtension: string,
    autoResolveConflicts: boolean
}

enum Error {
    parseError,
    noConfiguration,
    noFileSelected,
    fileReadError,
    noClipboardData,
    clipboardReadError
}

/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 */
const RestoreConfiguration = explainableComponent<HTMLElement, PropsWithChildren<Props>>((props, ref) => {
    const {children, fileExtension, source} = props
    const renderPlaceholder = useRenderPlaceholder();

    if (renderPlaceholder) {
        return children
    }

    const controlId = useControlId();
    const {restoreConfiguration} = useConfigurationStoring();
    const {handleExplainAnswer} = useExplain();

    const onClick = async () => {
        const storedConfiguration = pipe(await loadStoredConfiguration(source, fileExtension), O.toNullable)
        if (!storedConfiguration) {
            return
        }

        const mode: DropExistingDecisionsMode = ({
            type: "DropExistingDecisions",
            conflictHandling: match(props.autoResolveConflicts)
                .with(false, () => ({
                    type: "Manual",
                    includeConstraintsInConflictExplanation: false
                }) satisfies ManualConflictResolution)
                .with(true, () => ({
                    type: "Automatic"
                }) satisfies AutomaticConflictResolution)
                .exhaustive()
        })

        try {
            await restoreConfiguration(storedConfiguration, mode);
        } catch (e) {
            const error = e as ConfiguratorError;
            console.debug("Failed to restore stored configuration", error)

            if (error.type === ConfiguratorErrorType.StoredConfigurationInvalid) {
                alert("The specific configuration is not supported. Maybe the configuration was created with new application version than the current one.")
                return;
            }

            const hasConflict = error?.type === ConfiguratorErrorType.MakeManyDecisionsConflict && error.decisionExplanations;
            if (hasConflict) {
                if (props.explain !== "disabled") {
                    await handleExplainAnswer(error satisfies DecisionsExplainAnswer, props.explain, controlId);
                }
                return;
            }

            alert("Failed to restore your configuration.");
            return;
        }
    }

    return cloneChildrenWithProps(children, {onClick, ref})
})

export default RestoreConfiguration

const propertyControls: PropertyControls<PropsWithChildren<Props>> = {
    children: {
        title: "Content",
        type: ControlType.ComponentInstance,
    },
    source: {
        title: "Source",
        type: ControlType.Enum,
        defaultValue: "file",
        options: ["file", "clipboard"],
        optionTitles: ["File", "Clipboard"],
        displaySegmentedControl: true,
        segmentedControlDirection: "vertical"
    },
    fileExtension: {
        title: "File Extension",
        type: ControlType.String,
        defaultValue: "json",
        hidden: p => p.source !== "file"
    },
    autoResolveConflicts: {
        title: "Auto Resolve Conflicts",
        type: ControlType.Boolean,
        defaultValue: true
    },
    ...explainPropertyControls
}

addPropertyControls(RestoreConfiguration, propertyControls);

function openFile(fileExtension: string): TaskEither<Error, string> {
    return () => new Promise<Either<Error, string>>(resolve => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = `.${fileExtension}`;

        input.onchange = (e: Event) => {
            const target = e.target as HTMLInputElement;
            if (!target.files || target.files.length === 0) {
                resolve(left(Error.noFileSelected));
                return
            }

            const file = target.files[0];
            const reader = new FileReader();

            reader.onload = () => {
                resolve(right(reader.result as string));
            };

            reader.onerror = () => {
                resolve(left(Error.fileReadError));
            };

            reader.readAsText(file);
        };

        input.oncancel = () => {
            resolve(left(Error.noFileSelected));
        }

        input.click();
    });
}

function readFromClipboard(): TaskEither<Error, string> {
    return () => navigator.clipboard.readText()
        .then(text => {
            if (text) {
                return right(text);
            } else {
                return left(Error.noClipboardData);
            }
        })
        .catch(() => left(Error.clipboardReadError));
}

function loadStoredConfiguration(source: "file" | "clipboard", fileExtension: string): Promise<Option<StoredConfiguration>> {
    return pipe(
        source === "file" ? openFile(fileExtension) : readFromClipboard(),
        TE.chainEitherK(a => E.tryCatch(() => JSON.parse(a) as StoredConfigurationEnvelop, () => Error.parseError)),
        TE.filterOrElse(s => s.type === "spc-stored-configuration", () => Error.noConfiguration),
        TE.map(s => s.storedConfiguration),
        TE.doIfLeft(e => () => {
            console.debug(`Failed to load stored configuration: ${Error[e]}`)
            if (e == Error.fileReadError) {
                alert("Failed to read the selected file. Maybe it is damaged.")
            } else if (e == Error.noConfiguration || e == Error.parseError) {
                if (source === "file") {
                    alert("The selected file doesn't contain a valid configuration.")
                } else if (source === "clipboard") {
                    alert("The clipboard doesn't contain a valid configuration.")
                }
            } else if (e == Error.clipboardReadError) {
                alert("Can't read the clipboard. Make to give a permission for reading the clipboard.")
            } else if (e == Error.noClipboardData) {
                alert("The clipboard doesn't contain a configuration.")
            }
        }),
        TO.fromTaskEither
    )()
}