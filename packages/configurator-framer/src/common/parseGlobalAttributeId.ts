import type {GlobalAttributeId} from "@viamedici-spc/configurator-ts";
import type {AttributeIdProps} from "../props/attributeIdProps";

/**
 * Reads the global attribute id from a component's attribute id props. Components in a component path are separated by
 * " -> ". An empty component path means the attribute is in no component (`[]`), an empty shared configuration model
 * means it is in no shared model (`undefined`).
 */
export default function parseGlobalAttributeId(a: AttributeIdProps): GlobalAttributeId {
    return {
        localId: a.attributeId,
        componentPath: a.componentPath === "" ? [] : (a.componentPath?.split(" -> ") ?? []),
        sharedConfigurationModelId: a.sharedConfigurationModel === "" ? undefined : a.sharedConfigurationModel,
    };
}