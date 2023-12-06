import {GlobalAttributeId} from "@viamedici-spc/configurator-ts"

export default function parseGlobalAttributeId(a: { attributeId: string, componentPath: string, sharedConfigurationModel: string }): GlobalAttributeId {
    return {
        localId: a.attributeId,
        componentPath: a.componentPath === "" ? [] : a.componentPath?.split(" -> ") ?? [],
        sharedConfigurationModelId: a.sharedConfigurationModel === "" ? null : a.sharedConfigurationModel,
    }
}