import {pipe, RA} from "@viamedici-spc/fp-ts-extensions";
import {summonFor} from "@morphic-ts/batteries/lib/summoner-ESBAST";
import {AType} from "@morphic-ts/summoners";
import * as Props from "../props/choiceValueSortingProps";
import {GlobalAttributeId_, mapAttributeId, useGenericParseRawData} from "../common/RawDataParsing";

const {summon} = summonFor<{}>({});

const SortingRule_ = summon(F => F.interface({
    regex: F.string(),
    direction: F.keysOf({asc: null, desc: null}),
    mode: F.keysOf({isMatch: null, string: null, numeric: null}),
    description: F.optional(F.string())
}, "SortingRule"));

const RawChoiceValueSorting_ = summon(F => F.interface({
    defaultRules: F.array(SortingRule_(F)),
    attributes: F.array(F.interface({
        attributeId: GlobalAttributeId_(F),
        choiceValues: F.array(F.string()),
        rules: F.array(SortingRule_(F)),
    }, ""))
}, "RawChoiceValueSorting"));
type RawChoiceValueSorting = AType<typeof RawChoiceValueSorting_>;

function mapSorting(sorting: RawChoiceValueSorting): Props.ChoiceValueSorting {
    const defaultRules = pipe(
        sorting.defaultRules ?? [],
        RA.map(r => r satisfies Props.SortingRule),
        RA.toArray
    );
    const attributes = pipe(
        sorting.attributes ?? [],
        RA.map(a => ({
            ...mapAttributeId(a.attributeId),
            choiceValues: RA.toArray(a.choiceValues),
            rules: pipe(a.rules, RA.map(r => r satisfies Props.SortingRule), RA.toArray)
        } satisfies Props.ChoiceValueSorting["attributes"][number])),
        RA.toArray
    );

    return {
        attributes,
        defaultRules
    };
}

const useParseRawChoiceValueSorting = useGenericParseRawData("ChoiceValueSorting", RawChoiceValueSorting_.create, mapSorting);
export default useParseRawChoiceValueSorting;