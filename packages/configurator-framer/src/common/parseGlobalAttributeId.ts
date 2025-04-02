import {GlobalAttributeId} from "@viamedici-spc/configurator-ts";
import {AttributeIdProps} from "../props/attributeIdProps";

export default function parseGlobalAttributeId(a: AttributeIdProps): GlobalAttributeId {
    return {
        localId: a.attributeId,
        componentPath: a.componentPath === "" ? [] : a.componentPath?.split(" -> ") ?? [],
        sharedConfigurationModelId: a.sharedConfigurationModel === "" ? null : a.sharedConfigurationModel,
    };
}