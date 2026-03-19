import {createContext, ReactNode} from "react";

export type TemplateSlotIndex = 1 | 2 | 3 | 4 | 5;

export const templateSlotIndices: TemplateSlotIndex[] = [1, 2, 3, 4, 5];

export const TemplateSlotsContext = createContext<ReadonlyMap<TemplateSlotIndex, ReactNode | undefined> | null>(null);
