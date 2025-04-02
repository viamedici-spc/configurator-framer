import {addPropertyControls, ControlType, useLocaleInfo} from "framer"
import {AllowedRulesInExplainType, ClientSideSessionInitialisationOptions, ConfigurationModelSourceType, ServerSideSessionInitialisationOptions, SessionContext, WizardStep} from "@viamedici-spc/configurator-ts"
import {Configuration as ViaConfiguration} from "@viamedici-spc/configurator-react"
import {PropsWithChildren, ReactNode, Suspense, useEffect, useMemo} from "react"
import urlJoin from "url-join"
import {match} from "ts-pattern";
import useRenderPlaceholder from "../hooks/useRenderPlaceholder";
import InitializationError, {InitializationErrorProps} from "./InitializationError";
import withErrorBoundary from "../common/withErrorBoundary";
import DesignSystem from "../designSystem/DesignSystem";
import ExplainDialog from "./explain/explainDialog/ExplainDialog";
import {explainDialogPropertyControls, ExplainDialogProps} from "../props/explainDialogProps";
import {explainPopoverPropertyControls, ExplainPopoverProps, explainPopoverPropsContext} from "../props/explainPopoverProps";
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

type Props = InitializationErrorProps & ChoiceValueSortingProps & LocalizationProps & WizardAttributeRelationsProps & {
    hcaBaseUrl: string
    sessionCreation: "client-side" | "server-side"
    accessToken?: string,
    sessionCreateUrl?: string,
    sessionDeleteUrl?: string,
    deploymentName: string,
    channel: string,
    explainDialogProps: ExplainDialogProps,
    explainPopoverProps: ExplainPopoverProps,
    explainConstraints: boolean,
    attributeRelations: {
        // TODO: Implement later
        // type: "raw" | "wizard",
        // definition: object
        jsonDefinition: string
    }
}

/**
 * These annotations control how your component sizes
 * Learn more: https://www.framer.com/developers/#code-components-auto-sizing
 *
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 */
const Configuration = withErrorBoundary((props: PropsWithChildren<Props>) => {
    const {
        hcaBaseUrl, sessionCreation, accessToken, sessionCreateUrl,
        sessionDeleteUrl, deploymentName, channel, children, explainDialogProps,
        explainPopoverProps, explainConstraints
    } = props

    const {activeLocale} = useLocaleInfo();
    const localeCode = activeLocale.code;

    useEffect(() => {
        console.info("Current locale code:", localeCode)
    }, [localeCode]);

    const renderPlaceholder = useRenderPlaceholder();
    if (renderPlaceholder) {
        return (
            <>
                {children}

                <Singleton singletonId="Configuration">
                    <DesignSystem/>
                </Singleton>
            </>
        );
    }

    const parsedRawAttributeRelations = useParseRawAttributeRelations(props.attributeRelations?.jsonDefinition);
    const attributeRelations = useMemo(() => pipe(
        parsedRawAttributeRelations,
        O.fromEither,
        O.toNullable
    ), [parsedRawAttributeRelations]);

    const parsedRawChoiceValueSorting = useParseRawChoiceValueSorting(props.choiceValueSorting?.jsonDefinition);
    const choiceValueSorting = useMemo<ChoiceValueSorting>(() => pipe(
        parsedRawChoiceValueSorting,
        E.orElse(() => pipe(
            props.choiceValueSorting as ChoiceValueSorting,
            E.fromNullable<ReactNode>(null)
        )),
        E.getOrElse(() => ({
            attributes: [],
            defaultRules: []
        } satisfies ChoiceValueSorting))
    ), [parsedRawChoiceValueSorting, props.choiceValueSorting]);

    const parsedRawLocalization = useParseRawLocalization(props.localization?.jsonDefinition);
    const localization = useMemo<Localization>(() => pipe(
        parsedRawLocalization,
        E.getOrElse(() => ({
            attributes: [],
            choiceValues: []
        } satisfies Localization))
    ), [parsedRawLocalization]);

    const wizardAttributeRelations = pipe(
        props.wizardAttributeRelations?.wizardSteps,
        O.fromNullable,
        O.filter(RA.isNonEmpty),
        O.map(RA.map(s => ({attributes: pipe(s.attributes, RA.map(parseGlobalAttributeId))} satisfies WizardStep))),
        O.toNullable
    )

    const sessionContext = useMemo(() => ({
        apiBaseUrl: urlJoin(hcaBaseUrl, "api", "engine"),
        sessionInitialisationOptions: match(sessionCreation)
            .with("client-side", () => ({accessToken}) satisfies ClientSideSessionInitialisationOptions)
            .with("server-side", () => ({sessionCreateUrl}) satisfies ServerSideSessionInitialisationOptions)
            .exhaustive(),
        configurationModelSource: {
            type: ConfigurationModelSourceType.Channel,
            channel,
            deploymentName,
        },
        attributeRelations,
        wizardAttributeRelations,
        allowedInExplain: {rules: {type: AllowedRulesInExplainType.all}}
    } satisfies SessionContext), [hcaBaseUrl, sessionCreation, accessToken, sessionCreateUrl, sessionDeleteUrl, channel, deploymentName, attributeRelations])

    return (
        <>
            <ViaConfiguration sessionContext={sessionContext}>
                {pipe(parsedRawLocalization, E.swap, O.fromEither, O.toNullable)}
                {pipe(parsedRawChoiceValueSorting, E.swap, O.fromEither, O.toNullable)}
                {pipe(parsedRawAttributeRelations, E.swap, O.fromEither, O.toNullable)}

                <InitializationError {...props}/>

                <Suspense>
                    <localizationContext.Provider value={localization}>
                        <ExplainController explainConstraints={explainConstraints}>
                            <explainPopoverPropsContext.Provider value={explainPopoverProps}>
                                <choiceValueSortingContext.Provider value={choiceValueSorting}>
                                    {children}
                                </choiceValueSortingContext.Provider>
                            </explainPopoverPropsContext.Provider>
                            <ExplainDialog {...explainDialogProps}/>
                        </ExplainController>
                    </localizationContext.Provider>
                </Suspense>

            </ViaConfiguration>
            <Singleton singletonId="Configuration">
                <DesignSystem/>
            </Singleton>
        </>
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
        defaultValue: "https://spc.cloud.ceventis.de/hca",
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

