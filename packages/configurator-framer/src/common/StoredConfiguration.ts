import {AttributeType, ChoiceValueDecisionState, ChoiceValueId, ComponentDecisionState, GlobalAttributeId} from "@viamedici-spc/configurator-ts";

// TODO: Schema validation with Summons
export type StoredConfigurationEnvelop = {
    readonly type: "spc-stored-configuration",
    readonly storedConfiguration: StoredConfiguration
}

export type StoredConfiguration = {
    readonly schemaVersion: number
    readonly explicitDecisions: ReadonlyArray<Decision>
}

export type Decision = ChoiceDecision | NumericDecision | BooleanDecision | ComponentDecision

export type BaseDecision = {
    readonly type: AttributeType
    readonly attributeId: GlobalAttributeId
}

export type ChoiceDecision = BaseDecision & {
    readonly type: AttributeType.Choice
    readonly choiceValueId: ChoiceValueId
    readonly state: ChoiceValueDecisionState
}

export type NumericDecision = BaseDecision & {
    readonly type: AttributeType.Numeric
    readonly state: number
}

export type BooleanDecision = BaseDecision & {
    readonly type: AttributeType.Boolean
    readonly state: boolean
}

export type ComponentDecision = BaseDecision & {
    readonly type: AttributeType.Component
    readonly state: ComponentDecisionState
}