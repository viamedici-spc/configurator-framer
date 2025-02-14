import {AttributeRelations} from "@viamedici-spc/configurator-ts";
import {GlobalAttributeId_, useGenericParseRawData} from "../common/RawDataParsing";
import {z} from "zod";

const DecisionToRespect_ = z.object({
    attributeId: GlobalAttributeId_,
    decisions: GlobalAttributeId_.array()
});

const RawAttributeRelations_ = DecisionToRespect_.array();

const useParseRawAttributeRelations = useGenericParseRawData("AttributeRelations", RawAttributeRelations_, x => x as AttributeRelations);
export default useParseRawAttributeRelations;