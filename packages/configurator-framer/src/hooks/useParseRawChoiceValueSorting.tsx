import {pipe, RA} from "@viamedici-spc/fp-ts-extensions";
import * as Props from "../props/choiceValueSortingProps";
import {GlobalAttributeId_, mapAttributeId, useGenericParseRawData} from "../common/RawDataParsing";
import {z} from "zod";

const SortingRule_ = z.object({
    regex: z.string(),
    direction: z.enum(["asc", "desc"]),
    mode: z.enum(["isMatch", "string", "numeric"]),
    description: z.string().optional()
});

const RawChoiceValueSorting_ = z.object({
    defaultRules: SortingRule_.array().optional().nullish(),
    attributes: z.object({
        attributeId: GlobalAttributeId_,
        choiceValues: z.string().array(),
        rules: SortingRule_.array()
    }).array().optional().nullish()
});
type RawChoiceValueSorting = z.infer<typeof RawChoiceValueSorting_>;

function mapSorting(sorting: RawChoiceValueSorting): Props.ChoiceValueSorting {
    const defaultRules = pipe(
        sorting.defaultRules ?? [],
        RA.map(r => r as Props.SortingRule),
        RA.toArray
    );
    const attributes = pipe(
        sorting.attributes ?? [],
        RA.map(a => ({
            ...mapAttributeId(a.attributeId),
            choiceValues: RA.toArray(a.choiceValues),
            rules: pipe(a.rules, RA.map(r => r as Props.SortingRule), RA.toArray)
        } satisfies Props.ChoiceValueSorting["attributes"][number])),
        RA.toArray
    );

    return {
        attributes,
        defaultRules
    };
}

const useParseRawChoiceValueSorting = useGenericParseRawData("ChoiceValueSorting", RawChoiceValueSorting_, mapSorting);
export default useParseRawChoiceValueSorting;