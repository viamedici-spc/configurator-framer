import {createContext, useContext, useMemo} from "react";
import {ChoiceValueSorting} from "../props/choiceValueSortingProps";
import {ChoiceValue, ChoiceValueId, GlobalAttributeId} from "@viamedici-spc/configurator-ts";
import {useChoiceAttribute} from "@viamedici-spc/configurator-react";
import {createOrdCacheProvider} from "../common/ordCaching";
import {getOrdForAttribute} from "../common/choiceValueSorting";
import {Ord, pipe, RA, Str} from "@viamedici-spc/fp-ts-extensions";

const ordCacheProvider = createOrdCacheProvider();

export const choiceValueSortingContext = createContext<ChoiceValueSorting>(null);

export default function useSortedChoiceValues(attributeId: GlobalAttributeId, choiceValues?: ReadonlyArray<ChoiceValue>): ReadonlyArray<ChoiceValue> {
    const choiceValueSorting = useContext(choiceValueSortingContext);
    const ord = useMemo(() => pipe(
        getOrdForAttribute(attributeId, choiceValueSorting),
        ord => ordCacheProvider.getCache<ChoiceValueId>(Str.Eq, ord),
        Ord.contramap((value: ChoiceValue) => value.id)
    ), []);

    const {attribute} = useChoiceAttribute(attributeId);

    return pipe(
        choiceValues ?? attribute?.values ?? [],
        RA.sort(ord)
    );
}