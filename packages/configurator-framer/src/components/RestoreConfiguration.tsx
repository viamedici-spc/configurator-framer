import {addPropertyControls, ControlType, PropertyControls} from "framer"
import {PropsWithChildren} from "react";
import cloneChildrenWithProps from "../common/cloneChildrenWithProps";
import {useDecision} from "@viamedici-spc/configurator-react";
import {
    AttributeType,
    AutomaticConflictResolution,
    DecisionsExplainAnswer,
    ExplicitBooleanDecision,
    ExplicitChoiceDecision,
    ExplicitComponentDecision,
    ExplicitDecision,
    ExplicitNumericDecision,
    FailureResult,
    FailureType,
    ManualConflictResolution,
    SetManyDropExistingDecisionsMode
} from "@viamedici-spc/configurator-ts";
import {match} from "ts-pattern";
import {E, Either, left, O, Option, pipe, right, TaskEither, TE, TO} from "@viamedici-spc/fp-ts-extensions";
import {StoredConfiguration, StoredConfigurationEnvelop} from "../common/StoredConfiguration";
import useRenderPlaceholder from "../hooks/useRenderPlaceholder";
import {explainableComponent} from "../common/componentComposites";
import {explainPropertyControls, ExplainProps} from "../props/explainProps";
import {useControlId} from "../common/controlId";
import useExplain from "../hooks/useExplain";

// TODO: Use logic from configurator-ts v2

type Props = ExplainProps & {
    source: "file" | "clipboard"
    fileExtension: string,
    autoResolveConflicts: boolean
}

enum Error {
    parseError,
    noConfiguration,
    unsupportedSchemaVersion,
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
    const {setManyDecision} = useDecision();
    const {handleExplainAnswer} = useExplain();

    const onClick = async () => {
        const storedConfiguration = pipe(await loadStoredConfiguration(source, fileExtension), O.toNullable)
        if (!storedConfiguration) {
            return
        }

        const mode: SetManyDropExistingDecisionsMode = ({
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
            const decisions = mapDecisions(storedConfiguration)
            await setManyDecision(decisions, mode);
        } catch (e) {
            const failureResult = e as FailureResult;
            console.debug("Failed to restore stored configuration", failureResult)

            const hasConflict = failureResult?.type === FailureType.ConfigurationSetManyConflict && failureResult.decisionExplanations;
            if (hasConflict) {
                if (props.explain !== "disabled") {
                    await handleExplainAnswer(failureResult satisfies DecisionsExplainAnswer, props.explain, controlId);
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

function mapDecisions(configuration: StoredConfiguration): ReadonlyArray<ExplicitDecision> {
    return configuration.explicitDecisions.map(d => match(d)
        .returnType<ExplicitDecision>()
        .with({type: AttributeType.Choice}, d => ({type: AttributeType.Choice, attributeId: d.attributeId, choiceValueId: d.choiceValueId, state: d.state} satisfies ExplicitChoiceDecision))
        .with({type: AttributeType.Numeric}, d => ({type: AttributeType.Numeric, attributeId: d.attributeId, state: d.state} satisfies ExplicitNumericDecision))
        .with({type: AttributeType.Boolean}, d => ({type: AttributeType.Boolean, attributeId: d.attributeId, state: d.state} satisfies ExplicitBooleanDecision))
        .with({type: AttributeType.Component}, d => ({type: AttributeType.Component, attributeId: d.attributeId, state: d.state} satisfies ExplicitComponentDecision))
        .exhaustive())
}

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
        TE.filterOrElse(s => s.storedConfiguration?.schemaVersion === 1, () => Error.unsupportedSchemaVersion),
        // TODO: Summon schema validation of StoredConfiguration
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
            } else if (e == Error.unsupportedSchemaVersion) {
                alert("The specific configuration is not supported. Maybe the configuration was created with new application version than the current one.")
            } else if (e == Error.clipboardReadError) {
                alert("Can't read the clipboard. Make to give a permission for reading the clipboard.")
            } else if (e == Error.noClipboardData) {
                alert("The clipboard doesn't contain a configuration.")
            }
        }),
        TO.fromTaskEither
    )()
}