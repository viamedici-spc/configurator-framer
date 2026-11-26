import type {Attribute, ChoiceAttribute, ChoiceValue} from "@viamedici-spc/configurator-ts";
import {AttributeType, ChoiceValueDecisionState} from "@viamedici-spc/configurator-ts";
import type {PropsWithChildren, ReactNode} from "react";
import {act} from "react";
import type {Root} from "react-dom/client";
import {createRoot} from "react-dom/client";
import {vi} from "vitest";
import type {ExplainContext} from "../../src/common/explain";
import {explainContext} from "../../src/common/explain";

/**
 * The parts of `framer` the components use, as the preview renders them. Load it with
 * `vi.mock("framer", async () => (await import("./support/mocks")).framerModule)`.
 */
export const framerModule = {
    addPropertyControls: () => {},
    ControlType: new Proxy({}, {get: (_, key) => key}),
    RenderTarget: {current: () => session.renderTarget, preview: "PREVIEW", canvas: "CANVAS"},
    useLocaleInfo: () => session.localeInfo,
};

/** What the mocked configurator-react hooks return; each test sets what it needs. */
export const session = {
    attributes: new Map<string, Attribute>(),
    makeDecision: vi.fn(async () => {}),
    clearDecisions: vi.fn(async () => {}),
    localeInfo: {activeLocale: null as {code: string} | null, locales: [] as ReadonlyArray<{code: string}>},
    /** Where Framer renders: "PREVIEW" for the preview and published sites, "CANVAS" for the editor. */
    renderTarget: "PREVIEW" as "PREVIEW" | "CANVAS",
};

/**
 * The configurator-react hooks the components use, answered from {@link session}. Load it with
 * `vi.mock("@viamedici-spc/configurator-react", async () => (await import("./support/mocks")).configuratorReactModule)`.
 */
export const configuratorReactModule = {
    useAttributes: (ids: ReadonlyArray<{localId: string}>) => ids.map(id => session.attributes.get(id.localId)),
    useChoiceAttribute: (id: {localId: string}) => {
        const attribute = session.attributes.get(id.localId);
        return attribute?.type === AttributeType.Choice
            ? {attribute, clearDecisions: session.clearDecisions}
            : undefined;
    },
    useMakeDecision: () => ({makeDecision: session.makeDecision}),
};

export function resetSession(): void {
    session.attributes = new Map();
    session.makeDecision.mockClear();
    session.clearDecisions.mockClear();
    session.localeInfo = {activeLocale: null, locales: []};
    session.renderTarget = "PREVIEW";
}

export function choiceAttribute(localId: string, choiceValueIds: ReadonlyArray<string>): ChoiceAttribute {
    const values = new Map<string, ChoiceValue>(
        choiceValueIds.map(id => [
            id,
            {
                id,
                decision: null,
                possibleDecisionStates: [ChoiceValueDecisionState.Included, ChoiceValueDecisionState.Excluded],
                isPossibleDecisionStatesImmutable: false,
            } as unknown as ChoiceValue,
        ]),
    );
    return {type: AttributeType.Choice, id: {localId}, key: localId, values} as unknown as ChoiceAttribute;
}

const explain: ExplainContext = {
    switchMode: () => {},
    explain: async () => {},
    handleExplainAnswer: async () => {},
    applySolution: async () =>
        ({rejectedDecisions: []}) as unknown as Awaited<ReturnType<ExplainContext["applySolution"]>>,
    dismiss: () => {},
    process: null,
};

function ExplainProvider({children}: PropsWithChildren) {
    return <explainContext.Provider value={explain}>{children}</explainContext.Provider>;
}

/** A rendered tree inside the explain context the components expect from `<Configuration />`. */
export type Rendered = {readonly container: HTMLDivElement; readonly unmount: () => void};

export async function renderInConfiguration(element: ReactNode): Promise<Rendered> {
    return render(<ExplainProvider>{element}</ExplainProvider>);
}

/** A rendered tree without any provider, as a component renders on its own on the canvas. */
export async function render(element: ReactNode): Promise<Rendered> {
    (globalThis as {IS_REACT_ACT_ENVIRONMENT?: boolean}).IS_REACT_ACT_ENVIRONMENT = true;
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root: Root = createRoot(container);
    await act(async () => root.render(element));
    return {
        container,
        unmount: () => {
            act(() => root.unmount());
            container.remove();
        },
    };
}