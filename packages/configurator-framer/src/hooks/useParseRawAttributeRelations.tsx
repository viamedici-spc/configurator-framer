import {identity} from "@viamedici-spc/fp-ts-extensions";
import {summonFor} from "@morphic-ts/batteries/lib/summoner-ESBAST";
import {AttributeRelations} from "@viamedici-spc/configurator-ts";
import {GlobalAttributeId_, useGenericParseRawData} from "../common/RawDataParsing";

const {summon} = summonFor<{}>({});

const DecisionToRespect_ = summon(F => F.interface({
    attributeId: GlobalAttributeId_(F),
    decisions: F.array(GlobalAttributeId_(F))
}, "DecisionToRespect"));

const RawAttributeRelations_ = summon(F => F.array(DecisionToRespect_(F)));

const useParseRawAttributeRelations = useGenericParseRawData("AttributeRelations", RawAttributeRelations_.create, identity<AttributeRelations>);
export default useParseRawAttributeRelations;