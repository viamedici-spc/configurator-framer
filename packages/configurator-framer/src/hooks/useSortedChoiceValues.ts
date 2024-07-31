import {createContext, useContext, useMemo} from "react";
import {ChoiceValueSorting} from "../props/choiceValueSortingProps";
import {ChoiceValue, ChoiceValueId, GlobalAttributeId} from "@viamedici-spc/configurator-ts";
import {useChoiceAttribute} from "@viamedici-spc/configurator-react";
import {createOrdCacheProvider} from "../common/ordCaching";
import {getOrdForAttribute} from "../common/choiceValueSorting";
import {O, Ord, pipe, RA, RR, Str} from "@viamedici-spc/fp-ts-extensions";
import {ChoiceValueNames} from "./localization";

const ordCacheProvider = createOrdCacheProvider();

export const choiceValueSortingContext = createContext<ChoiceValueSorting>(null);

export default function useSortedChoiceValues(attributeId: GlobalAttributeId, choiceValueNames: ChoiceValueNames, choiceValues?: ReadonlyArray<ChoiceValue>): ReadonlyArray<ChoiceValue> {
    const choiceValueSorting = useContext(choiceValueSortingContext);
    const ord = useMemo(() => pipe(
        getOrdForAttribute(attributeId, choiceValueSorting),
        ord => ordCacheProvider.getCache<ChoiceValueId>(Str.Eq, ord),
        Ord.contramap((value: ChoiceValue) => pipe(
            choiceValueNames,
            RR.lookup(value.id),
            O.match(() => value.id, n => n)
        ))
    ), [choiceValueNames]);

    const {attribute} = useChoiceAttribute(attributeId);

    return pipe(
        choiceValues ?? attribute?.values ?? [],
        RA.sort(ord)
    );
}