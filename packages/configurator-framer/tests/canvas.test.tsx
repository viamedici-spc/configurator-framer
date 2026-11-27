import {afterEach, describe, expect, it, vi} from "vitest";
import AttributeValueList from "../src/components/explain/custom/common/AttributeValueList";
import type {Rendered} from "./support/mocks";
import {render, resetSession, session} from "./support/mocks";

vi.mock("framer", async () => (await import("./support/mocks")).framerModule);
vi.mock("@viamedici-spc/configurator-react", async () => (await import("./support/mocks")).configuratorReactModule);

function Item(props: {displayName?: string}) {
    return <span>{props.displayName}</span>;
}

describe("On the canvas, without a Configuration", () => {
    let rendered: Rendered | undefined;
    afterEach(() => {
        rendered?.unmount();
        resetSession();
    });

    it("CustomExplainAttributeValueList shows its placeholder values", async () => {
        session.renderTarget = "CANVAS";
        const consoleError = vi.spyOn(console, "error");
        try {
            rendered = await render(<AttributeValueList itemTemplate={<Item />} />);
            expect(rendered.container.textContent).toBe("Value AValue BValue C");
            expect(consoleError).not.toHaveBeenCalled();
        } finally {
            consoleError.mockRestore();
        }
    });
});