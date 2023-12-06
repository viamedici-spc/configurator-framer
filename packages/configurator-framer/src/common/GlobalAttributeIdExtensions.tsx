import {GlobalAttributeId} from "@viamedici-spc/configurator-ts";

export function globalAttributeIdToString(attributeId: GlobalAttributeId): string {
    const sharedModel = attributeId.sharedConfigurationModelId && `shared::${attributeId.sharedConfigurationModelId}`;
    const componentPath = (attributeId.componentPath ?? []).join("::");

    return [sharedModel, componentPath, attributeId.localId]
        .filter(s => s?.length > 0)
        .join("::");
}