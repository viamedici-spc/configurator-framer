import {ChoiceValueSorting, SortingRule} from "../props/choiceValueSortingProps";
import {Bool, Num, O, Option, Ord, OrdT, pipe, RA, Str, MO} from "@viamedici-spc/fp-ts-extensions";
import {ChoiceValueId, GlobalAttributeId, globalAttributeIdEq} from "@viamedici-spc/configurator-ts";
import {match, P} from "ts-pattern";
import parseGlobalAttributeId from "./parseGlobalAttributeId";
import {Ordering} from "fp-ts/Ordering";

const monoid = Ord.getMonoid<ChoiceValueId>();

const intlCollatorBase = new Intl.Collator("en", {sensitivity: "base"});
const intlCollatorVariant = new Intl.Collator("en", {sensitivity: "variant"});

const fallbackRule: SortingRule = {
    regex: ".*",
    direction: "asc",
    mode: "string",
};

export const stringModeOrd = pipe(
    [intlCollatorBase, intlCollatorVariant],
    RA.map(getOrdForIntlCollator),
    MO.concatAll(Ord.getMonoid<string>())
);

export const isMatchModeOrd = pipe(
    Bool.Ord,
    Ord.contramap((o: Option<string>) => O.isSome(o))
);

export const numericModeOrd = Num.Ord;

export function getOrdForAttribute(attributeId: GlobalAttributeId, sorting: ChoiceValueSorting): OrdT<ChoiceValueId> {
    return pipe(
        sorting?.attributes ?? [],
        RA.findFirst(a => globalAttributeIdEq.equals(parseGlobalAttributeId(a), attributeId)),
        O.map(a => [
            getOrdForExplicitChoiceValueSorting(a.choiceValues ?? []),
            getOrdForSortingRules(a.rules ?? [])
        ]),
        O.getOrElse(() => [
            getOrdForSortingRules(sorting?.defaultRules ?? [])
        ]),
        RA.append(getOrdFromSortingRule(fallbackRule)),
        MO.concatAll(monoid)
    );
}

export function getOrdForExplicitChoiceValueSorting(explicitSorting: ReadonlyArray<ChoiceValueId>): OrdT<ChoiceValueId> {
    return pipe(
        Num.Ord,
        Ord.reverse,
        O.getOrd,
        Ord.reverse,
        Ord.contramap((id: ChoiceValueId) => pipe(
            explicitSorting,
            RA.findIndex(i => Str.Eq.equals(id, i))
        ))
    );
}

export function getOrdForSortingRules(sortingRules: ReadonlyArray<SortingRule>): OrdT<ChoiceValueId> {
    return pipe(
        sortingRules,
        RA.map(getOrdFromSortingRule),
        MO.concatAll(monoid)
    );
}

export function getOrdFromSortingRule(sortingRule: SortingRule): OrdT<ChoiceValueId> {
    const regExp = O.tryCatch(() => new RegExp(sortingRule.regex));

    const handler = match(sortingRule.mode)
        .returnType<OrdT<Option<string>>>()
        .with("string", () => getStringModeHandler(sortingRule.direction))
        .with("numeric", () => getNumericModeHandler(sortingRule.direction))
        .with("isMatch", () => getIsMatchModeHandler(sortingRule.direction))
        .exhaustive();

    return pipe(
        handler,
        Ord.contramap((choiceValueId: ChoiceValueId) => pipe(
            regExp,
            O.chainNullableK(r => {
                // Reset the Regex.
                r.lastIndex = 0;
                return r[Symbol.match](choiceValueId);
            }),
            O.chain(a => pipe(
                a,
                RA.lookup(1),
                O.alt(() => pipe(
                    a,
                    RA.lookup(0)
                ))
            ))
        ))
    );
}

function getStringModeHandler(direction: SortingRule["direction"]): OrdT<Option<string>> {
    return pipe(
        stringModeOrd,
        applyDirection(direction),
        getSomeAlwaysOnTopOrd
    );
}

function getNumericModeHandler(direction: SortingRule["direction"]): OrdT<Option<string>> {
    return pipe(
        numericModeOrd,
        applyDirection(direction),
        getSomeAlwaysOnTopOrd,
        Ord.contramap(O.chain(Num.parseFloatO))
    );
}

function getIsMatchModeHandler(direction: SortingRule["direction"]): OrdT<Option<string>> {
    return pipe(
        isMatchModeOrd,
        applyDirection(direction)
    );
}

export function getSomeAlwaysOnTopOrd<T>(ord: OrdT<T>): OrdT<Option<T>> {
    return pipe(
        ord,
        Ord.reverse,
        O.getOrd,
        Ord.reverse
    );
}

export function applyDirection(direction: SortingRule["direction"]): <T>(ord: OrdT<T>) => OrdT<T> {
    return <T>(ord) => match(direction)
        .returnType<OrdT<T>>()
        .with("asc", () => ord)
        .with("desc", () => Ord.reverse(ord))
        .exhaustive();
}

function getOrdForIntlCollator(collator: Intl.Collator): OrdT<string> {
    return Ord.fromCompare<string>((first, second) => match(collator.compare(first, second))
        .returnType<Ordering>()
        .with(P.number.gt(0), () => 1)
        .with(P.number.lt(0), () => -1)
        .otherwise(() => 0));
}