import {describe, expect, it} from "vitest";
import {renderToStaticMarkup} from "react-dom/server";
import SetTemplateSlots from "../src/components/SetTemplateSlots";
import TemplateSlot from "../src/components/TemplateSlot";

function Template() {
    return (
        <div>
            <TemplateSlot index={1}/>
            <TemplateSlot index={2}/>
        </div>
    );
}

function NestedTemplate() {
    return (
        <div>
            <TemplateSlot index={1}/>
        </div>
    );
}

describe("Template slots", () => {
    it("renders configured content into matching template slots", () => {
        const result = renderToStaticMarkup(
            <SetTemplateSlots
                template={<Template/>}
                content1={<strong>Injected 1</strong>}
                content2={<em>Injected 2</em>}
            />
        );

        expect(result).toBe("<div><strong>Injected 1</strong><em>Injected 2</em></div>");
    });

    it("renders a placeholder when no content is found for a slot", () => {
        const result = renderToStaticMarkup(
            <SetTemplateSlots
                template={<TemplateSlot index={3}/>}
            />
        );

        expect(result).toBe("<span>No content found for slot 3</span>");
    });

    it("uses the nearest set template slots scope", () => {
        const result = renderToStaticMarkup(
            <SetTemplateSlots
                template={
                    <div>
                        <TemplateSlot index={1}/>
                        <SetTemplateSlots template={<NestedTemplate/>} content1={<em>Inner</em>}/>
                    </div>
                }
                content1={<strong>Outer</strong>}
            />
        );

        expect(result).toBe("<div><strong>Outer</strong><div><em>Inner</em></div></div>");
    });
});
