import {afterEach, describe, expect, it, vi} from "vitest";
import PopoverClose from "../src/components/popover/PopoverClose";
import type {Rendered} from "./support/mocks";
import {renderInConfiguration} from "./support/mocks";

vi.mock("framer", async () => (await import("./support/mocks")).framerModule);
vi.mock("@viamedici-spc/configurator-react", async () => (await import("./support/mocks")).configuratorReactModule);

describe("Error boundaries", () => {
    let rendered: Rendered | undefined;
    afterEach(() => rendered?.unmount());

    it("PopoverClose outside a Popover shows that it crashed instead of crashing the canvas", async () => {
        // React reports the caught error on the console.
        const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
        try {
            rendered = await renderInConfiguration(<PopoverClose />);
            expect(rendered.container.textContent).toBe("Component crashed");
        } finally {
            consoleError.mockRestore();
        }
    });
});