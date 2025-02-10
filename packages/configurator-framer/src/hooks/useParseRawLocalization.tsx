import {LocalizableText, Localization} from "../props/localizationProps";
import {pipe, RA} from "@viamedici-spc/fp-ts-extensions";
import {summonFor} from "@morphic-ts/batteries/lib/summoner-ESBAST";
import {AType} from "@morphic-ts/summoners";
import {GlobalAttributeId_, mapAttributeId, useGenericParseRawData} from "../common/RawDataParsing";

const {summon} = summonFor<{}>({});

const AttributeLocalization_ = summon(F => F.interface({
    attributeId: GlobalAttributeId_(F),
    name: F.array(F.interface({
        localeCode: F.string(),
        translation: F.string()
    }, "Name"))
}, "AttributeLocalization"));

const ChoiceValueLocalization_ = summon(F => F.intersection(
    AttributeLocalization_(F),
    F.interface({
        choiceValueId: F.string(),
    }, "")
)("ChoiceValueLocalization"));

const RawLocalization_ = summon(F => F.interface({
    attributes: F.optional(F.array(AttributeLocalization_(F))),
    choiceValues: F.optional(F.array(ChoiceValueLocalization_(F))),
}, "RawLocalization"));

type RawLocalization = AType<typeof RawLocalization_>;
type AttributeLocalization = AType<typeof AttributeLocalization_>;

function mapAttributeLocalization(attribute: AttributeLocalization) {
    return {
        ...mapAttributeId(attribute.attributeId),
        name: pipe(
            attribute.name,
            RA.map(n => n satisfies LocalizableText[number]),
            RA.toArray
        )
    } satisfies Localization["attributes"][number];
}

function mapLocalization(localization: RawLocalization): Localization {
    const attributes = pipe(
        localization.attributes ?? RA.empty,
        RA.map(mapAttributeLocalization),
        RA.toArray
    );
    const choiceValues = pipe(
        localization.choiceValues ?? RA.empty,
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

const useParseRawLocalization = useGenericParseRawData("Localization", RawLocalization_.create, mapLocalization);
export default useParseRawLocalization;