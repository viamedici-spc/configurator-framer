import camelcase from "camelcase";
import {pipe, Str} from "@viamedici-spc/fp-ts-extensions";

export default function normalizePropName(name: string) {
    return pipe(
        name,
        Str.replace(/[\s\u2013]/g, "-"),
        camelcase
    );
}