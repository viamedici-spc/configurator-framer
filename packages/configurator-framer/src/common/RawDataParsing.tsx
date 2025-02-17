import {E, Either, flow, O, P, pipe, Str} from "@viamedici-spc/fp-ts-extensions";
import {ReactNode, useMemo} from "react";
import {AttributeIdProps} from "../props/attributeIdProps";
import {json} from "fp-ts";
import {InitializationErrorMessage} from "../components/InitializationErrorMessage";
import {z, ZodType} from "zod";
import {fromError} from 'zod-validation-error';

export const GlobalAttributeId_ = z.object({
    localId: z.string(),
    componentPath: z.string().array().optional().nullish(),
    sharedConfigurationModelId: z.string().optional().nullish(),
});

export function mapAttributeId(attributeId: z.infer<typeof GlobalAttributeId_>): AttributeIdProps {
    return {
        sharedConfigurationModel: attributeId.sharedConfigurationModelId ?? "",
        componentPath: attributeId.componentPath?.join(" -> ") ?? "",
        attributeId: attributeId.localId,
    };
}

export function useGenericParseRawData<R, O>(name: string, zodType: ZodType<R>, mapper: (rawData: R) => O) {
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
                E.mapLeft(l => "The JSON content could not be parsed. Please check for syntax errors.\n" + l.toString()),
                E.chain(o => pipe(
                    zodType.safeParse(o),
                    pr => pr.success ? E.right(pr.data) : E.left(pr.error),
                    E.mapLeft(e => fromError(e, {maxIssuesInMessage: 5, issueSeparator: "\n- "})),
                    E.mapLeft(e => "The JSON schema is invalid. Ensure all required fields and types are correctly defined.\n" + e.toString())
                )),
                E.map(mapper),
                E.mapLeft<string, ReactNode>(s =>
                    <InitializationErrorMessage
                        type="warning"
                        title={name + " definition is invalid and was ignored"}
                        message={s}/>
                )
            ))
        ), [jsonDefinition]);
    };
}