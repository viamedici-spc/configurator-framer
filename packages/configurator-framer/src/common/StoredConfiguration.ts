import {StoredConfiguration} from "@viamedici-spc/configurator-ts";

export type StoredConfigurationEnvelop = {
    readonly type: "spc-stored-configuration",
    readonly storedConfiguration: StoredConfiguration
}