import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import {act} from "react";
import SetSelection from "../src/components/SetSelection";
import type {Rendered} from "./support/mocks";
import {choiceAttribute, renderInConfiguration, resetSession, session} from "./support/mocks";

vi.mock("framer", async () => (await import("./support/mocks")).framerModule);
vi.mock("@viamedici-spc/configurator-react", async () => (await import("./support/mocks")).configuratorReactModule);

const attributeProps = {attributeId: "Color", componentPath: "", sharedConfigurationModel: ""};

describe("SetSelection", () => {
    let rendered: Rendered | undefined;

    beforeEach(() => {
        resetSession();
        session.attributes.set("Color", choiceAttribute("Color", ["Red", "Blue"]));
    });
    afterEach(() => rendered?.unmount());

    it("shows a hint and sends no decision on a choice attribute without a choice value id", async () => {
        rendered = await renderInConfiguration(
            <SetSelection
                {...attributeProps}
                choiceValueId=""
                setSelection="included"
                numericValue={0}
                attributeIds={[]}
                explain="disabled"
            >
                <button>Select</button>
            </SetSelection>,
        );

        await act(async () => rendered!.container.querySelector("button")?.click());

        expect(rendered.container.textContent).toBe("Choice Value Id missing");
        expect(session.makeDecision).not.toHaveBeenCalled();
    });

    it("clears the choice attribute's decisions without a choice value id when set to undefined", async () => {
        rendered = await renderInConfiguration(
            <SetSelection
                {...attributeProps}
                choiceValueId=""
                setSelection="undefined"
                numericValue={0}
                attributeIds={[]}
                explain="disabled"
            >
                <button>Clear</button>
            </SetSelection>,
        );

        await act(async () => rendered!.container.querySelector("button")?.click());

        expect(session.clearDecisions).toHaveBeenCalledTimes(1);
        expect(session.makeDecision).not.toHaveBeenCalled();
    });
});