import {createContext, useContext, useMemo} from "react";
import {ChoiceValueId, GlobalAttributeId, globalAttributeIdEquals} from "@viamedici-spc/configurator-ts";
import {useChoiceAttribute} from "@viamedici-spc/configurator-react";
import {LocalizableText, Localization} from "../props/localizationProps";
import {useLocaleInfo} from "framer";
import {flow, O, Option, pipe, RA, RR} from "@viamedici-spc/fp-ts-extensions";
import parseGlobalAttributeId from "../common/parseGlobalAttributeId";

export const localizationContext = createContext<Localization>(null);
export type ChoiceValueNames = Record<ChoiceValueId, string>;

export function useAttributeName(attributeId: GlobalAttributeId): string | undefined {
    const {attributes} = useContext(localizationContext);
    const {activeLocale} = useLocaleInfo();
    const localeCode = activeLocale.code;

    return useMemo(() => pipe(
        attributes,
        RA.findFirst(a => globalAttributeIdEquals(parseGlobalAttributeId(a), attributeId)),
        O.map(a => a.name),
        RA.fromOption,
        RA.flatten,
        getLocalizedName(localeCode),
        O.toUndefined
    ), [attributes, localeCode, attributeId.localId, attributeId.componentPath, attributeId.sharedConfigurationModelId]);
}

export function useChoiceValueNames(attributeId: GlobalAttributeId): ChoiceValueNames {
    const {choiceValues: choiceValueLocalizations} = useContext(localizationContext);
    const {activeLocale} = useLocaleInfo();
    const choiceAttribute = useChoiceAttribute(attributeId);
    if (!choiceAttribute) {
        return {};
    }

    const attributeLocalizations = useMemo(() => pipe(
        choiceValueLocalizations,
        RA.filter(c => globalAttributeIdEquals(parseGlobalAttributeId(c), attributeId))
    ), [choiceValueLocalizations, attributeId.localId, attributeId.componentPath, attributeId.sharedConfigurationModelId]);

    const localeCode = activeLocale.code;
    const values = choiceAttribute.attribute.values;

    return useMemo(() => pipe(
        values,
        RA.map(v => pipe(
            attributeLocalizations,
            RA.findFirst(c => c.choiceValueId === v.id),
            O.map(c => c.name),
            RA.fromOption,
            RA.flatten,
            getLocalizedName(localeCode),
            O.map(l => [v.id, l] as [ChoiceValueId, string])
        )),
        RA.compact,
        RR.fromEntries
    ), [values, attributeLocalizations, localeCode]);
}

export function useChoiceValueName(attributeId: GlobalAttributeId, choiceValueId: ChoiceValueId): string | undefined {
    const {choiceValues} = useContext(localizationContext);
    const {activeLocale} = useLocaleInfo();
    const localeCode = activeLocale.code;

    return useMemo(() => pipe(
        choiceValues,
        RA.findFirst(v => globalAttributeIdEquals(parseGlobalAttributeId(v), attributeId) && v.choiceValueId === choiceValueId),
        O.map(v => v.name),
        RA.fromOption,
        RA.flatten,
        getLocalizedName(localeCode),
        O.toUndefined
    ), [choiceValues, localeCode, attributeId.localId, attributeId.componentPath, attributeId.sharedConfigurationModelId, choiceValueId]);
}


function getLocalizedName(localeCode: string): (name: LocalizableText) => Option<string> {
    return flow(
        RA.findFirst(l => l.localeCode.localeCompare(localeCode, undefined, {sensitivity: "accent"}) === 0),
        O.map(l => l.translation)
    );
}