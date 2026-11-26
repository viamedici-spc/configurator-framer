import {createContext, useContext, useMemo} from "react";
import type {ChoiceValueSorting} from "../props/choiceValueSortingProps";
import type {ChoiceValue, ChoiceValueId, GlobalAttributeId} from "@viamedici-spc/configurator-ts";
import {useChoiceAttribute} from "@viamedici-spc/configurator-react";
import {createOrdCacheProvider} from "../common/ordCaching";
import {getOrdForAttribute} from "../common/choiceValueSorting";
import {Ord, pipe, RA, Str} from "@viamedici-spc/fp-ts-extensions";

const ordCacheProvider = createOrdCacheProvider();

export const choiceValueSortingContext = createContext<ChoiceValueSorting | null>(null);

/**
 * Sorts choice values by the choice value sorting of `<Configuration />` for the attribute.
 * @param choiceValues The values to sort; the attribute's own values when omitted.
 * @returns The sorted values. Without `choiceValues` the result is empty for an unknown attribute or one that is not a
 * choice attribute.
 */
export default function useSortedChoiceValues(
    attributeId: GlobalAttributeId,
    choiceValues?: ReadonlyArray<ChoiceValue>,
): ReadonlyArray<ChoiceValue> {
    const choiceValueSorting = useContext(choiceValueSortingContext);
    const ord = useMemo(
        () =>
            pipe(
                getOrdForAttribute(attributeId, choiceValueSorting),
                ord => ordCacheProvider.getCache<ChoiceValueId>(Str.Eq, ord),
                Ord.contramap((value: ChoiceValue) => value.id),
            ),
        [],
    );

    const attribute = useChoiceAttribute(attributeId)?.attribute;

    return pipe(
        // The attribute holds its values in a map, which RA.sort cannot sort.
        choiceValues ?? (attribute ? Array.from(attribute.values.values()) : []),
        RA.sort(ord),
    );
}