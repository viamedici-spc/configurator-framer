import {E, Either, flow, O, Option, P, pipe, RA, some, Str} from "@viamedici-spc/fp-ts-extensions";
import {ReactNode, useMemo} from "react";
import type {Create} from "@morphic-ts/io-ts-interpreters/lib/create";
import {summonFor} from "@morphic-ts/batteries/lib/summoner-ESBAST";
import {GlobalAttributeId} from "@viamedici-spc/configurator-ts";
import {AttributeIdProps} from "../props/attributeIdProps";
import {json} from "fp-ts";
import {InitializationErrorMessage} from "../components/InitializationErrorMessage";

const {summon} = summonFor<{}>({});

export const GlobalAttributeId_ = summon(F => F.interface({
    localId: F.string(),
    componentPath: F.optional(F.array(F.string())),
    sharedConfigurationModelId: F.optional(F.string()),
}, "GlobalAttributeId"));

type PipelineError = {
    message: string;
    originalError: Option<unknown>;
}

export function mapAttributeId(attributeId: GlobalAttributeId): AttributeIdProps {
    return {
        sharedConfigurationModel: attributeId.sharedConfigurationModelId ?? "",
        componentPath: attributeId.componentPath?.join(" -> ") ?? "",
        attributeId: attributeId.localId,
    };
}

export function useGenericParseRawData<R, O>(name: string, createRawData: Create<R>, mapper: (rawData: R) => O) {
    return (jsonDefinition: string): Either<ReactNode, O> => {
        return useMemo(() => pipe(
            // A missing JSON is considered an error but without returning an error output.
            // This allows performing fallbacks.
            jsonDefinition,
            O.fromNullable,
            O.filter(P.not(Str.isEmpty)),
            E.fromOption<ReactNode>(() => null),
            E.chain(flow(
                json.parse,
                E.mapLeft(l => ({
                    message: "Error while parsing JSON.",
                    originalError: some(l)
                } satisfies PipelineError)),
                E.chain(o => pipe(
                    E.tryCatch(() => createRawData(o as any), e => e),
                    E.flatten,
                    E.mapLeft(l => ({
                        message: "Format is invalid.",
                        originalError: some(l)
                    } satisfies PipelineError)),
                )),
                E.map(mapper),
                E.doIfLeft(l => () => {
                    console.log(name, l.message, ...pipe(
                        l.originalError,
                        RA.fromOption,
                        RA.prepend("Additional information:")
                    ))
                }),
                E.mapLeft<PipelineError, ReactNode>(s =>
                    <InitializationErrorMessage
                        type="warning"
                        title={name + " definition is invalid and was ignored"}
                        message={(
                            <>
                                {s.message}
                                {O.isSome(s.originalError) && (
                                    <>
                                        <br/>
                                        <div>
                                            See developer console for more information.
                                        </div>
                                    </>
                                )}
                            </>
                        )}/>
                )
            ))
        ), [jsonDefinition]);
    };
}