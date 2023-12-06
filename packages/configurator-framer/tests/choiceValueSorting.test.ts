import {describe, it, expect} from "vitest";
import {SortingRule} from "../src/props/choiceValueSortingProps";
import {ChoiceValueId} from "@viamedici-spc/configurator-ts";
import {applyDirection, getSomeAlwaysOnTopOrd, getOrdFromSortingRule, getOrdForSortingRules, getOrdForExplicitChoiceValueSorting, isMatchModeOrd, stringModeOrd} from "../src/common/choiceValueSorting";
import {none, Num, OrdT, pipe, RA, some} from "@viamedici-spc/fp-ts-extensions";

const ruleSortingTestCases = [
    {
        givesChoiceValueIds: [
            "14 m", "14 ml", "None", "51 cm", "10 l", "28 kg", "87.78 l", "1000 l", "banana", "1.001 l", "honeydew", "fig", "89 ml", "lemon", "100 l", "26 cm",
            "57 kg", "Apple", "7242", "Elderberry", "78 sqm", "35 sqm", "13.04", "3.76", "50.43", "date", "Grape", "Cherry", "72.6842", "92.72", "62", "jackfruit", "63.58"
        ] satisfies ChoiceValueId[],
        expectedChoiceValueIds: [
            "26 cm", "51 cm", "28 kg", "57 kg", "1.001 l", "10 l", "87.78 l", "100 l", "1000 l", "14 m", "14 ml", "89 ml", "35 sqm", "78 sqm", "3.76", "13.04",
            "50.43", "62", "63.58", "72.6842", "92.72", "7242", "Apple", "banana", "Cherry", "date", "Elderberry", "fig", "Grape", "honeydew", "jackfruit", "lemon", "None"
        ] satisfies ChoiceValueId[],
        sortingRules: [
            // Orders specifically "None" to the end
            {
                regex: "^(None)$",
                mode: "isMatch",
                direction: "asc"
            },
            // Orders numbers with units like "10 ml" by unit
            {
                regex: "^[0-9]+(?:\.[0-9])?[0-9]*([^0-9]+)$",
                mode: "string",
                direction: "asc"
            },
            // Orders numbers with units like "10 ml" by value
            {
                regex: "^([0-9]+(?:\.[0-9])?[0-9]*)[^0-9.]",
                mode: "numeric",
                direction: "asc"
            },
            // Orders pure numbers
            {
                regex: "^[0-9]+(?:\.[0-9])?[0-9]*$",
                mode: "numeric",
                direction: "asc"
            },
            // Orders anything else
            {
                regex: ".*",
                mode: "string",
                direction: "asc"
            }
        ] satisfies SortingRule[]
    }
];

describe("ChoiceValue Sorting tests", () => {
    describe("SortingRule tests", () => {
        it.each(ruleSortingTestCases)("TestCases", (args) => {
            const ord = getOrdForSortingRules(args.sortingRules);
            const result = pipe(
                args.givesChoiceValueIds,
                RA.sort(ord)
            );

            expect(result).toStrictEqual(args.expectedChoiceValueIds);

        });

        describe("SingleSortingRule tests", () => {
            it("Mode - isMatch", () => {
                testSortingRule(
                    {
                        regex: "^([0-9]+(?:\.[0-9])?[0-9]*)[^0-9]",
                        mode: "isMatch"
                    },
                    ["87.78 l", "x87.78 l"],
                    ["x87.78 l", "87.78 l"],
                    ["87.78 l", "x87.78 l"]
                );
            });

            it("Mode - numeric", () => {
                testSortingRule(
                    {
                        // Orders numbers with units like "10 ml" by value
                        regex: "^([0-9]+(?:\.[0-9])?[0-9]*)[^0-9]",
                        mode: "numeric"
                    },
                    ["87.78 l", "x87.78 l", "1000 l"],
                    ["87.78 l", "1000 l", "x87.78 l"],
                    ["1000 l", "87.78 l", "x87.78 l"]
                );
            });

            it("Mode - string", () => {
                testSortingRule(
                    {
                        // Orders numbers with units like "10 ml" by unit
                        regex: "^[0-9]+(?:\.[0-9])?[0-9]*([^0-9]+)$",
                        mode: "string"
                    },
                    ["28 kg", "87.78 l", "51 cm", "92.72", "Apple"],
                    // "92.72" and "Apple" are always at the end, because they don't match the regex.
                    ["51 cm", "28 kg", "87.78 l", "92.72", "Apple"],
                    ["87.78 l", "28 kg", "51 cm", "92.72", "Apple"]
                );
            });
        });
    });

    describe("Basic Ord tests", () => {
        it("isMatchMode", () => {
            testOrd(
                isMatchModeOrd,
                [some("1"), none],
                [none, some("1")]
            );
        });

        it("stringMode", () => {
            testOrd(
                stringModeOrd,
                ["b", "Z", "a", "z", "A"],
                ["a", "A", "b", "z", "Z"]
            );
        });

        it("getSomeAlwaysOnTopOrd", () => {
            const ord = getSomeAlwaysOnTopOrd(Num.Ord);

            testOrd(
                ord,
                [some(4), none, some(1), none, some(2)],
                [some(1), some(2), some(4), none, none]
            );
        });

        it("applyDirection asc", () => {
            const ord = applyDirection("asc")(Num.Ord);

            testOrd(
                ord,
                [3, 2, 7, 1],
                [1, 2, 3, 7]
            );
        });

        it("applyDirection desc", () => {
            const ord = applyDirection("desc")(Num.Ord);

            testOrd(
                ord,
                [3, 2, 7, 1],
                [7, 3, 2, 1]
            );
        });

        it("getOrdForExplicitChoiceValueSorting", () => {
            const c1: ChoiceValueId = "c1";
            const c2: ChoiceValueId = "c2";
            const c3: ChoiceValueId = "c3";
            const c4: ChoiceValueId = "c4";
            const c5: ChoiceValueId = "c5";
            const c6: ChoiceValueId = "c6";
            const ord = getOrdForExplicitChoiceValueSorting([c2, "c7", c1, c3, "c8", c4]);

            testOrd(
                ord,
                [c5, c6, c4, c2, c3, c1],
                [c2, c1, c3, c4, c5, c6]
            );
        });
    });
});

function testSortingRule(sortingRule: Omit<SortingRule, "direction">, testData: ReadonlyArray<ChoiceValueId>, expectedDataAsc: ReadonlyArray<ChoiceValueId>, expectedDataDesc: ReadonlyArray<ChoiceValueId>) {
    const ascOrd = getOrdFromSortingRule({
        ...sortingRule,
        direction: "asc"
    });
    const descOrd = getOrdFromSortingRule({
        ...sortingRule,
        direction: "desc"
    });

    testOrd(
        ascOrd,
        testData,
        expectedDataAsc
    );

    testOrd(
        descOrd,
        testData,
        expectedDataDesc
    );
}

function testOrd<T>(ord: OrdT<T>, testData: ReadonlyArray<T>, expectedData: ReadonlyArray<T>) {
    const result = pipe(
        testData,
        RA.sort(ord)
    );

    expect(result).toStrictEqual(expectedData);
}