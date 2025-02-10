import {Children, ReactNode} from "react";
import {useConfigurationInitialization} from "@viamedici-spc/configurator-react";
import useRenderPlaceholder from "../hooks/useRenderPlaceholder";
import {ConfiguratorErrorType} from "@viamedici-spc/configurator-ts";
import {InitializationErrorMessage} from "./InitializationErrorMessage";

type Props = {
    configurationModelNotFoundContent?: ReactNode,
    accessTokenInvalidContent?: ReactNode,
    accessTokenRestrictionContent?: ReactNode,
    errorContent?: ReactNode
}
export type InitializationErrorProps = Props;

export default function InitializationError(props: Props) {
    const renderPlaceholder = useRenderPlaceholder();

    if (renderPlaceholder) {
        return null;
    }

    const {error} = useConfigurationInitialization();
    if (!error) {
        return null;
    }

    const standardErrorMessage = (message: string) => <InitializationErrorMessage
        type="error"
        title="Configuration initialization failed"
        message={message}/>

    switch (error.type) {
        case ConfiguratorErrorType.ConfigurationModelNotFound:
            return Children.toArray(props.configurationModelNotFoundContent).length > 0
                ? props.configurationModelNotFoundContent
                : standardErrorMessage("Configuration Model not found for the specified deployment name.");

        case ConfiguratorErrorType.AuthenticationFailure:
            return Children.toArray(props.accessTokenInvalidContent).length > 0
                ? props.accessTokenInvalidContent
                : standardErrorMessage("The HCA access token is invalid.");

        case ConfiguratorErrorType.SpecifiedDeploymentForbidden:
            return Children.toArray(props.accessTokenRestrictionContent).length > 0
                ? props.accessTokenRestrictionContent
                : standardErrorMessage("The HCA access token does not permit using the specified Configuration Model.");

        case ConfiguratorErrorType.DecisionsToRespectInvalid:
            return standardErrorMessage("The definition of Attribute Relations is invalid.");

        default:
            return Children.toArray(props.errorContent).length > 0
                ? props.errorContent
                : standardErrorMessage("An error occurred while initializing the configuration.");
    }
}