import {createContext, useMemo} from "react";
import type {ChoiceValueId, GlobalAttributeId} from "@viamedici-spc/configurator-ts";
import { globalAttributeIdEq} from "@viamedici-spc/configurator-ts";
import {useChoiceAttribute} from "@viamedici-spc/configurator-react";
import type {LocalizableText, Localization} from "../props/localizationProps";
import {useLocaleInfo} from "framer";
import type { Option} from "@viamedici-spc/fp-ts-extensions";
import {flow, O, pipe, RA, RM, RR} from "@viamedici-spc/fp-ts-extensions";
import parseGlobalAttributeId from "../common/parseGlobalAttributeId";
import useRequiredContext from "../common/useRequiredContext";

export const localizationContext = createContext<Localization | null>(null);
export type ChoiceValueNames = ReadonlyMap<ChoiceValueId, string>;

export function useAttributeName(attributeId: GlobalAttributeId): string | undefined {
    const {attributes} = useRequiredContext(localizationContext, "Configuration");
    const {activeLocale} = useLocaleInfo();
    const localeCode = activeLocale?.code;

    return useMemo(() => pipe(
        attributes,
        RA.findFirst(a => globalAttributeIdEq.equals(parseGlobalAttributeId(a), attributeId)),
        O.map(a => a.name),
        RA.fromOption,
        RA.flatten,
        getLocalizedName(localeCode),
        O.toUndefined
    ), [attributes, localeCode, attributeId.localId, attributeId.componentPath, attributeId.sharedConfigurationModelId]);
}

export function useChoiceValueNames(attributeId: GlobalAttributeId): ChoiceValueNames {
    const {choiceValues: choiceValueLocalizations} = useRequiredContext(localizationContext, "Configuration");
    const {activeLocale} = useLocaleInfo();
    const choiceAttribute = useChoiceAttribute(attributeId);
    if (!choiceAttribute) {
        return RM.empty;
    }

    // TODO: Maybe to dictionary to improve performance. Keep new SourceAttributeId in mind!
    const attributeLocalizations = useMemo(() => pipe(
        choiceValueLocalizations,
        RA.filter(c => globalAttributeIdEq.equals(parseGlobalAttributeId(c), attributeId))
    ), [choiceValueLocalizations, attributeId.localId, attributeId.componentPath, attributeId.sharedConfigurationModelId]);

    const localeCode = activeLocale?.code;
    const values = choiceAttribute.attribute.values;

    return useMemo(() => pipe(
        values,
        RM.mapWithIndex((k, _) => pipe(
            attributeLocalizations,
            RA.findFirst(c => c.choiceValueId === k),
            O.map(c => c.name),
            RA.fromOption,
            RA.flatten,
            getLocalizedName(localeCode),
        )),
        RM.compact
    ), [values, attributeLocalizations, localeCode]);
}

export function useChoiceValueName(attributeId: GlobalAttributeId, choiceValueId: ChoiceValueId): string | undefined {
    const {choiceValues} = useRequiredContext(localizationContext, "Configuration");
    const {activeLocale} = useLocaleInfo();
    const localeCode = activeLocale?.code;

    return useMemo(() => pipe(
        choiceValues,
        RA.findFirst(v => globalAttributeIdEq.equals(parseGlobalAttributeId(v), attributeId) && v.choiceValueId === choiceValueId),
        O.map(v => v.name),
        RA.fromOption,
        RA.flatten,
        getLocalizedName(localeCode),
        O.toUndefined
    ), [choiceValues, localeCode, attributeId.localId, attributeId.componentPath, attributeId.sharedConfigurationModelId, choiceValueId]);
}


function getLocalizedName(localeCode: string | undefined): (name: Readonly<LocalizableText>) => Option<string> {
    return flow(
        RA.findFirst(l => localeCode != null && l.localeCode.localeCompare(localeCode, undefined, {sensitivity: "accent"}) === 0),
        O.map(l => l.translation)
    );
}