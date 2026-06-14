import {afterEach, describe, expect, it, vi} from "vitest";
import {
    createHostParametersStore,
    EMPTY_PARAMS,
    MSG_PARAMETERS,
    MSG_PARAMETERS_REQUEST,
    shallowEqualParameters,
} from "../src/common/hostParametersStore";

const tick = () => new Promise<void>(resolve => setTimeout(resolve, 0));

afterEach(() => {
    document.body.innerHTML = "";
    vi.restoreAllMocks();
});

describe("shallowEqualParameters", () => {
    it("treats identical and equal records as equal", () => {
        const a = {region: "eu", webshop: "true"};
        expect(shallowEqualParameters(a, a)).toBe(true);
        expect(shallowEqualParameters({region: "eu"}, {region: "eu"})).toBe(true);
    });

    it("detects added, removed and changed keys", () => {
        expect(shallowEqualParameters({region: "eu"}, {region: "eu", webshop: "true"})).toBe(false);
        expect(shallowEqualParameters({region: "eu", webshop: "true"}, {region: "eu"})).toBe(false);
        expect(shallowEqualParameters({region: "eu"}, {region: "de"})).toBe(false);
    });
});

describe("createHostParametersStore — native mode", () => {
    function mountNativeHost(attributes: Record<string, string>): Element {
        const host = document.createElement("spc-embedded-configurator-native");
        for (const [name, value] of Object.entries(attributes)) {
            host.setAttribute(name, value);
        }
        const anchor = document.createElement("div");
        host.appendChild(anchor);
        document.body.appendChild(host);
        return anchor;
    }

    it("reads data-* attributes with the prefix stripped", () => {
        const anchor = mountNativeHost({"data-region": "eu", "data-webshop": "true", "class": "ignored"});
        const store = createHostParametersStore(anchor);
        store.subscribe(() => {});
        expect(store.getSnapshot()).toEqual({region: "eu", webshop: "true"});
    });

    it("notifies and returns a new reference when an attribute changes", async () => {
        const anchor = mountNativeHost({"data-region": "eu"});
        const host = anchor.parentElement!;
        const store = createHostParametersStore(anchor);
        const listener = vi.fn();
        store.subscribe(listener);

        const before = store.getSnapshot();
        host.setAttribute("data-region", "de");
        await tick();

        expect(listener).toHaveBeenCalledTimes(1);
        expect(store.getSnapshot()).not.toBe(before);
        expect(store.getSnapshot()).toEqual({region: "de"});
    });

    it("does not notify when an attribute is set to the same value", async () => {
        const anchor = mountNativeHost({"data-region": "eu"});
        const host = anchor.parentElement!;
        const store = createHostParametersStore(anchor);
        const listener = vi.fn();
        store.subscribe(listener);

        const before = store.getSnapshot();
        host.setAttribute("data-region", "eu");
        await tick();

        expect(listener).not.toHaveBeenCalled();
        expect(store.getSnapshot()).toBe(before);
    });

    it("returns a stable snapshot reference across calls", () => {
        const anchor = mountNativeHost({"data-region": "eu"});
        const store = createHostParametersStore(anchor);
        store.subscribe(() => {});
        expect(store.getSnapshot()).toBe(store.getSnapshot());
    });
});

describe("createHostParametersStore — iframe mode", () => {
    // No native host ancestor → the store falls back to the postMessage transport.
    function detachedAnchor(): Element {
        return document.createElement("div");
    }

    function postFromParent(parameters: unknown, type: string = MSG_PARAMETERS) {
        window.dispatchEvent(new MessageEvent("message", {data: {type, parameters}, source: window.parent}));
    }

    it("posts a handshake request on subscribe", () => {
        const postMessage = vi.spyOn(window.parent, "postMessage");
        const store = createHostParametersStore(detachedAnchor());
        store.subscribe(() => {});
        expect(postMessage).toHaveBeenCalledWith({type: MSG_PARAMETERS_REQUEST}, "*");
    });

    it("commits parameters received from the parent window", () => {
        const store = createHostParametersStore(detachedAnchor());
        const listener = vi.fn();
        store.subscribe(listener);

        postFromParent({region: "eu", webshop: "true"});

        expect(listener).toHaveBeenCalledTimes(1);
        expect(store.getSnapshot()).toEqual({region: "eu", webshop: "true"});
    });

    it("coerces non-string parameter values to strings", () => {
        const store = createHostParametersStore(detachedAnchor());
        store.subscribe(() => {});
        postFromParent({count: 3, webshop: true});
        expect(store.getSnapshot()).toEqual({count: "3", webshop: "true"});
    });

    it("ignores messages with the wrong source or type", () => {
        const store = createHostParametersStore(detachedAnchor());
        const listener = vi.fn();
        store.subscribe(listener);

        // Wrong source.
        window.dispatchEvent(new MessageEvent("message", {data: {type: MSG_PARAMETERS, parameters: {region: "eu"}}, source: null}));
        // Wrong type.
        postFromParent({region: "eu"}, "spc.configurator.height");

        expect(listener).not.toHaveBeenCalled();
        expect(store.getSnapshot()).toBe(EMPTY_PARAMS);
    });
});
