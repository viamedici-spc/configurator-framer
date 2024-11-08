import {addPropertyControls, ControlType, useLocaleInfo} from "framer"
import {AllowedRulesInExplainType, ClientSideSessionInitialisationOptions, ConfigurationModelSourceType, ServerSideSessionInitialisationOptions, SessionContext,} from "@viamedici-spc/configurator-ts"
import {Configuration as ViaConfiguration} from "@viamedici-spc/configurator-react"
import {PropsWithChildren, Suspense, useEffect, useMemo} from "react"
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
import {O, pipe} from "@viamedici-spc/fp-ts-extensions";
import Singleton from "./Singleton";
import {ChoiceValueSorting, choiceValueSortingPropertyControls, ChoiceValueSortingProps} from "../props/choiceValueSortingProps";
import {choiceValueSortingContext} from "../hooks/useSortedChoiceValues";
import {Localization, localizationPropertyControls, LocalizationProps} from "../props/localizationProps";
import {localizationContext} from "../hooks/localization";

type Props = InitializationErrorProps & ChoiceValueSortingProps & LocalizationProps & {
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

    // TODO: Schema validation with Summons
    const attributeRelations = useMemo(() => pipe(
        O.fromNullable(props.attributeRelations?.jsonDefinition),
        O.filter(d => d.length > 0),
        O.map(d => JSON.parse(d)),
        O.toNullable
    ), [props.attributeRelations]);

    // TODO: Schema validation with Summons
    const choiceValueSorting = useMemo(() => pipe(
        O.fromNullable(props.choiceValueSorting?.jsonDefinition),
        O.filter(d => d.length > 0),
        O.map(d => JSON.parse(d) as ChoiceValueSorting),
        O.orElse(() => O.fromNullable(props.choiceValueSorting as ChoiceValueSorting)),
        O.getOrElse(() => ({
            attributes: [],
            defaultRules: []
        } satisfies ChoiceValueSorting))
    ), [props.choiceValueSorting]);

    // TODO: Schema validation with Summons
    const localization = useMemo(() => pipe(
        O.fromNullable(props.localization?.jsonDefinition),
        O.filter(d => d.length > 0),
        O.map(d => JSON.parse(d) as Localization),
        O.getOrElse(() => ({
            attributes: [],
            choiceValues: []
        } satisfies Localization))
    ), [props.localization]);

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
        allowedInExplain: {rules: {type: AllowedRulesInExplainType.all}}
    } satisfies SessionContext), [hcaBaseUrl, sessionCreation, accessToken, sessionCreateUrl, sessionDeleteUrl, channel, deploymentName, attributeRelations])

    return (
        <>
            <ViaConfiguration sessionContext={sessionContext}>
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
    ...choiceValueSortingPropertyControls,
    ...localizationPropertyControls
})

