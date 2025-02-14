import {LocalizableText, Localization} from "../props/localizationProps";
import {pipe, RA} from "@viamedici-spc/fp-ts-extensions";
import {GlobalAttributeId_, mapAttributeId, useGenericParseRawData} from "../common/RawDataParsing";
import {z} from "zod";

const AttributeLocalization_ = z.object({
    attributeId: GlobalAttributeId_,
    name: z.array(z.object({
        localeCode: z.string(),
        translation: z.string()
    }))
});

const ChoiceValueLocalization_ = AttributeLocalization_.extend({
    choiceValueId: z.string(),
});

const RawLocalization_ = z.object({
    attributes: AttributeLocalization_.array().optional().nullish(),
    choiceValues: ChoiceValueLocalization_.array().optional().nullish(),
});

type RawLocalization = z.infer<typeof RawLocalization_>;
type AttributeLocalization = z.infer<typeof AttributeLocalization_>;

function mapAttributeLocalization(attribute: AttributeLocalization) {
    return {
        ...mapAttributeId(attribute.attributeId),
        name: pipe(
            attribute.name,
            RA.map(n => n as LocalizableText[number]),
            RA.toArray
        )
    } satisfies Localization["attributes"][number];
}

function mapLocalization(localization: RawLocalization): Localization {
    const attributes = pipe(
        localization.attributes ?? [],
        RA.map(mapAttributeLocalization),
        RA.toArray
    );
    const choiceValues = pipe(
        localization.choiceValues ?? [],
        RA.map(cv => ({
            ...mapAttributeLocalization(cv),
            choiceValueId: cv.choiceValueId
        } satisfies Localization["choiceValues"][number])),
        RA.toArray
    );

    return {
        attributes,
        choiceValues,
    };
}

const useParseRawLocalization = useGenericParseRawData("Localization", RawLocalization_, mapLocalization);
export default useParseRawLocalization;