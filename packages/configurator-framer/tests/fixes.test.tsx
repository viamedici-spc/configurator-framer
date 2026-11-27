import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import type {PropsWithChildren} from "react";
import type {ChoiceValue} from "@viamedici-spc/configurator-ts";
import AttributeName from "../src/components/AttributeName";
import ReplaceText from "../src/components/ReplaceText";
import SelectionToggle from "../src/components/SelectionToggle";
import useSortedChoiceValues from "../src/hooks/useSortedChoiceValues";
import type {Localization} from "../src/props/localizationProps";
import {localizationContext} from "../src/hooks/localization";
import type {Rendered} from "./support/mocks";
import {choiceAttribute, renderInConfiguration, resetSession, session} from "./support/mocks";

vi.mock("framer", async () => (await import("./support/mocks")).framerModule);
vi.mock("@viamedici-spc/configurator-react", async () => (await import("./support/mocks")).configuratorReactModule);

const colorProps = {attributeId: "Color", componentPath: "", sharedConfigurationModel: ""};

const localization: Localization = {
    attributes: [{...colorProps, name: [{localeCode: "de", translation: "Farbe"}]}],
    choiceValues: [],
};

function LocalizationProvider({children}: PropsWithChildren) {
    return <localizationContext.Provider value={localization}>{children}</localizationContext.Provider>;
}

function SortedValues(props: {attributeId: string}) {
    const values: ReadonlyArray<ChoiceValue> = useSortedChoiceValues({localId: props.attributeId});
    return <span>{values.map(v => v.id).join(",")}</span>;
}

describe("Fixes", () => {
    let rendered: Rendered | undefined;
    // A component that crashes is caught by its error boundary; React reports that on the console.
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

    beforeEach(() => {
        resetSession();
        session.attributes.set("Color", choiceAttribute("Color", ["Red", "Blue"]));
    });
    afterEach(() => {
        rendered?.unmount();
        consoleError.mockClear();
    });

    it("AttributeName falls back to the attribute id when Framer reports no active locale", async () => {
        session.localeInfo = {activeLocale: null, locales: []};
        rendered = await renderInConfiguration(
            <LocalizationProvider>
                <AttributeName
                    {...colorProps}
                    mode="replace"
                    replaceString="<AttributeName>"
                    elementName=""
                    propName=""
                >
                    {"<AttributeName>"}
                </AttributeName>
            </LocalizationProvider>,
        );

        expect(rendered.container.textContent).toBe("Color");
    });

    it("useSortedChoiceValues returns no values for an unknown attribute", async () => {
        rendered = await renderInConfiguration(<SortedValues attributeId="Unknown" />);

        expect(rendered.container.textContent).toBe("");
    });

    it("useSortedChoiceValues sorts the values of a choice attribute, which it holds in a map", async () => {
        rendered = await renderInConfiguration(<SortedValues attributeId="Color" />);

        expect(rendered.container.textContent).toBe("Blue,Red");
    });

    it("ReplaceText in set-prop mode skips empty children", async () => {
        rendered = await renderInConfiguration(
            <ReplaceText mode="set-prop" replaceString="" elementName="Target" propName="title" text="T">
                {null}
                <span>kept</span>
            </ReplaceText>,
        );

        expect(rendered.container.textContent).toBe("kept");
    });

    it("SelectionToggle shows a hint on a choice attribute without a choice value id", async () => {
        rendered = await renderInConfiguration(
            <SelectionToggle
                {...colorProps}
                choiceValueId=""
                toggleFrom="undefined"
                toggleTo="included"
                explain="disabled"
            >
                <button>Toggle</button>
            </SelectionToggle>,
        );

        expect(rendered.container.textContent).toBe("Choice Value Id missing");
    });
});