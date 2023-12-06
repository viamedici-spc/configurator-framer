import {Children, ReactNode} from "react";
import {useConfigurationInitialization} from "@viamedici-spc/configurator-react";
import useRenderPlaceholder from "../hooks/useRenderPlaceholder";
import {FailureType} from "@viamedici-spc/configurator-ts";

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

    switch (error.type) {
        case FailureType.ConfigurationModelNotFound:
            return Children.toArray(props.configurationModelNotFoundContent).length > 0
                ? props.configurationModelNotFoundContent
                : <span>Configuration Model not found for the specified deployment name.</span>;

        case FailureType.ConfigurationUnauthenticated:
            return Children.toArray(props.accessTokenInvalidContent).length > 0
                ? props.accessTokenInvalidContent
                : <span>The HCA access token is invalid.</span>;

        case FailureType.SpecifiedDeploymentForbidden:
            return Children.toArray(props.accessTokenRestrictionContent).length > 0
                ? props.accessTokenRestrictionContent
                : <span>The HCA access token does not permit using the specified Configuration Model.</span>;

        case FailureType.DecisionsToRespectInvalid:
            return <span>The definition of Attribute Relations is invalid.</span>;

        default:
            return Children.toArray(props.errorContent).length > 0
                ? props.errorContent
                : <span>An error occurred while initializing the configuration.</span>;
    }
}