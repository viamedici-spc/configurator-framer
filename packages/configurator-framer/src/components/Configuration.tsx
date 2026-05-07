import {addPropertyControls, ControlType, useLocaleInfo} from "framer"
import {StyleSheetManager} from "styled-components"
import {cssVariablePrefixPlugin} from "../designSystem/cssVariablePrefixPlugin"
import {AllowedRulesInExplainType, ClientSideSessionInitialisationOptions, ConfigurationModelSourceType, ServerSideSessionInitialisationOptions, SessionContext, WizardStep} from "@viamedici-spc/configurator-ts"
import {Configuration as ViaConfiguration} from "@viamedici-spc/configurator-react"
import {PropsWithChildren, ReactNode, Suspense, useContext, useEffect, useMemo} from "react"
import urlJoin from "url-join"
import {match} from "ts-pattern";
import useRenderPlaceholder from "../hooks/useRenderPlaceholder";
import InitializationError, {InitializationErrorProps} from "./InitializationError";
import withErrorBoundary from "../common/withErrorBoundary";
import DesignSystem from "../designSystem/DesignSystem";
import ExplainDialog from "./explain/ExplainDialog";
import {explainDialogPropertyControls, ExplainDialogProps} from "../props/explain/explainDialogProps";
import {explainPopoverPropertyControls, ExplainPopoverProps, explainPopoverPropsContext} from "../props/explain/explainPopoverProps";
import ExplainController from "./explain/ExplainController";
import {O, pipe, E, RA} from "@viamedici-spc/fp-ts-extensions";
import Singleton from "./Singleton";
import {ChoiceValueSorting, choiceValueSortingPropertyControls, ChoiceValueSortingProps} from "../props/choiceValueSortingProps";
import {choiceValueSortingContext} from "../hooks/useSortedChoiceValues";
import {Localization, localizationPropertyControls, LocalizationProps} from "../props/localizationProps";
import {localizationContext} from "../hooks/localization";
import useParseRawLocalization from "../hooks/useParseRawLocalization";
import useParseRawChoiceValueSorting from "../hooks/useParseRawChoiceValueSorting";
import useParseRawAttributeRelations from "../hooks/useParseRawAttributeRelations";
import {wizardAttributeRelationsPropertyControls, WizardAttributeRelationsProps} from "../props/wizardAttributeRelationsProps";
import parseGlobalAttributeId from "../common/parseGlobalAttributeId";
import {configurationPropsContext} from "./ConfigurationPropsProvider";

export type ConfigurationProps = InitializationErrorProps & ChoiceValueSortingProps & LocalizationProps & WizardAttributeRelationsProps & {
    hcaBaseUrl: string
    sessionCreation: "client-side" | "server-side"
    accessToken?: string,
    sessionCreateUrl?: string,
    sessionDeleteUrl?: string,
    deploymentName: string,
    channel: string,
    explainDialogProps: ExplainDialogProps,
    explainPopoverProps: ExplainPopoverProps,
    customExplainPopover?: ReactNode,
    explainConstraints: boolean,
    attributeRelations: {
        jsonDefinition: string
    }
};

export type ConfigurationOverrideableProps = Partial<Pick<ConfigurationProps,
    "attributeRelations" |
    "choiceValueSorting" |
    "localization" |
    "wizardAttributeRelations" |
    "hcaBaseUrl" |
    "sessionCreation" |
    "accessToken" |
    "sessionCreateUrl" |
    "sessionDeleteUrl" |
    "deploymentName" |
    "channel"
>>;

/**
 * These annotations control how your component sizes
 * Learn more: https://www.framer.com/developers/#code-components-auto-sizing
 *
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 */
const Configuration = withErrorBoundary((props: PropsWithChildren<ConfigurationProps>) => {
    const propOverrides = useContext(configurationPropsContext);
    const p = Object.assign({}, props, propOverrides) as PropsWithChildren<ConfigurationProps>;

    const {activeLocale} = useLocaleInfo();
    const localeCode = activeLocale.code;

    useEffect(() => {
        console.info("[Configuration] Current locale code:", localeCode)
    }, [localeCode]);

    const renderPlaceholder = useRenderPlaceholder();
    if (renderPlaceholder) {
        return (
            <StyleSheetManager stylisPlugins={[cssVariablePrefixPlugin]}>
                {p.children}

                <Singleton singletonId="Configuration">
                    <DesignSystem/>
                </Singleton>
            </StyleSheetManager>
        );
    }

    const parsedRawAttributeRelations = useParseRawAttributeRelations(p.attributeRelations?.jsonDefinition);
    const attributeRelations = useMemo(() => pipe(
        parsedRawAttributeRelations,
        O.fromEither,
        O.toNullable
    ), [parsedRawAttributeRelations]);

    const parsedRawChoiceValueSorting = useParseRawChoiceValueSorting(p.choiceValueSorting?.jsonDefinition);
    const choiceValueSorting = useMemo<ChoiceValueSorting>(() => pipe(
        parsedRawChoiceValueSorting,
        E.orElse(() => pipe(
            p.choiceValueSorting as ChoiceValueSorting,
            E.fromNullable<ReactNode>(null)
        )),
        E.getOrElse(() => ({
            attributes: [],
            defaultRules: []
        } satisfies ChoiceValueSorting))
    ), [parsedRawChoiceValueSorting, p.choiceValueSorting]);

    const parsedRawLocalization = useParseRawLocalization(p.localization?.jsonDefinition);
    const resolvedLocalization = useMemo<Localization>(() => pipe(
        parsedRawLocalization,
        E.getOrElse(() => ({
            attributes: [],
            choiceValues: []
        } satisfies Localization))
    ), [parsedRawLocalization]);

    const wizardAttributeRelations = pipe(
        p.wizardAttributeRelations?.wizardSteps,
        O.fromNullable,
        O.filter(RA.isNonEmpty),
        O.map(RA.map(s => ({attributes: pipe(s.attributes, RA.map(parseGlobalAttributeId))} satisfies WizardStep))),
        O.toNullable
    )

    const sessionContext = useMemo(() => ({
        apiBaseUrl: urlJoin(p.hcaBaseUrl, "api", "engine"),
        sessionInitialisationOptions: match(p.sessionCreation)
            .with("client-side", () => ({accessToken: p.accessToken}) satisfies ClientSideSessionInitialisationOptions)
            .with("server-side", () => ({sessionCreateUrl: p.sessionCreateUrl}) satisfies ServerSideSessionInitialisationOptions)
            .exhaustive(),
        configurationModelSource: {
            type: ConfigurationModelSourceType.Channel,
            channel: p.channel,
            deploymentName: p.deploymentName,
        },
        attributeRelations,
        wizardAttributeRelations,
        allowedInExplain: {rules: {type: AllowedRulesInExplainType.all}}
    } satisfies SessionContext), [p.hcaBaseUrl, p.sessionCreation, p.accessToken, p.sessionCreateUrl, p.sessionDeleteUrl, p.channel, p.deploymentName, attributeRelations])

    return (
        <StyleSheetManager stylisPlugins={[cssVariablePrefixPlugin]}>
            <ViaConfiguration sessionContext={sessionContext}>
                {pipe(parsedRawLocalization, E.swap, O.fromEither, O.toNullable)}
                {pipe(parsedRawChoiceValueSorting, E.swap, O.fromEither, O.toNullable)}
                {pipe(parsedRawAttributeRelations, E.swap, O.fromEither, O.toNullable)}

                <InitializationError {...p}/>

                <Suspense>
                    <localizationContext.Provider value={resolvedLocalization}>
                        <ExplainController explainConstraints={p.explainConstraints}>
                            <explainPopoverPropsContext.Provider value={{...p.explainPopoverProps, customPopover: p.customExplainPopover}}>
                                <choiceValueSortingContext.Provider value={choiceValueSorting}>
                                    {p.children}
                                </choiceValueSortingContext.Provider>
                            </explainPopoverPropsContext.Provider>
                            <ExplainDialog {...p.explainDialogProps}/>
                        </ExplainController>
                    </localizationContext.Provider>
                </Suspense>

            </ViaConfiguration>
            <Singleton singletonId="Configuration">
                <DesignSystem/>
            </Singleton>
        </StyleSheetManager>
    )
})

export default Configuration;

addPropertyControls(Configuration, {
    children: {
        title: "Content",
        type: ControlType.ComponentInstance,
    },
    channel: {
        type: ControlType.String,
        title: "Channel",
        defaultValue: "release",
    },
    deploymentName: {
        type: ControlType.String,
        title: "Deployment Name",
    },
    hcaBaseUrl: {
        title: "HCA Base URL",
        type: ControlType.String,
        defaultValue: "https://spc.viamedici.io/hca",
    },
    sessionCreation: {
        title: "Session Creation",
        type: ControlType.Enum,
        displaySegmentedControl: true,
        segmentedControlDirection: "horizontal",
        defaultValue: "client-side",
        options: ["client-side", "server-side"],
    },
    accessToken: {
        title: "HCA Access Token",
        type: ControlType.String,
        obscured: true,
        hidden: (props) => props.sessionCreation !== "client-side"
    },
    sessionCreateUrl: {
        title: "Create Session URl",
        type: ControlType.String,
        hidden: (props) => props.sessionCreation !== "server-side"
        // description: "Example: https://my-service.org/configurator/session/create"
    },
    sessionDeleteUrl: {
        title: "Close Session URl",
        type: ControlType.String,
        hidden: (props) => props.sessionCreation !== "server-side"
        // description: "Example: https://my-service.org/configurator/session/close"
    },
    configurationModelNotFoundContent: {
        title: "Content – Configuration Model not found",
        type: ControlType.ComponentInstance
    },
    errorContent: {
        title: "Content – Error",
        type: ControlType.ComponentInstance
    },
    accessTokenInvalidContent: {
        title: "Content – HCA Access Token invalid",
        type: ControlType.ComponentInstance
    },
    accessTokenRestrictionContent: {
        title: "Content – HCA Access Token restriction",
        type: ControlType.ComponentInstance
    },
    explainDialogProps: {
        title: "Explain Dialog",
        type: ControlType.Object,
        optional: false,
        controls: explainDialogPropertyControls,
        buttonTitle: "Props…"
    },
    explainPopoverProps: {
        title: "Explain Popover",
        type: ControlType.Object,
        optional: false,
        controls: explainPopoverPropertyControls,
        buttonTitle: "Props…"
    },
    customExplainPopover: {
        title: "Custom Explain Popover",
        type: ControlType.ComponentInstance
    },
    explainConstraints: {
        title: "Explain Constraints",
        type: ControlType.Boolean,
        defaultValue: false
        // description: "If true, in addition to decisions, also constraints (rules, cardinalities) will be explained. This is primarily for development purposes."
    },
    attributeRelations: {
        title: "Attribute Relations",
        type: ControlType.Object,
        defaultValue: null,
        buttonTitle: "Definition…",
        controls: {
            jsonDefinition: {
                title: "Definition – JSON",
                type: ControlType.String,
                displayTextArea: true
            }
        }
    },
    ...wizardAttributeRelationsPropertyControls,
    ...choiceValueSortingPropertyControls,
    ...localizationPropertyControls
})
