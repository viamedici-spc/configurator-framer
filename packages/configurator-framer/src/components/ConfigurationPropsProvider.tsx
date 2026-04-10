import {createContext, PropsWithChildren} from "react";
import withErrorBoundary from "../common/withErrorBoundary";
import {ConfigurationOverrideableProps} from "./Configuration";

type Props = PropsWithChildren<ConfigurationOverrideableProps>;
export type ConfigurationPropOverrides = ConfigurationOverrideableProps;
export const configurationPropsContext = createContext<ConfigurationOverrideableProps | null>(null);

const ConfigurationPropsProvider = withErrorBoundary((props: Props) => {
    const {children, ...overrides} = props;

    return (
        <configurationPropsContext.Provider value={overrides}>
            {children}
        </configurationPropsContext.Provider>
    )
})

export default ConfigurationPropsProvider;
