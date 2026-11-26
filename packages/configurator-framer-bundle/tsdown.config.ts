import {defineConfig, type UserConfigFn} from "tsdown";

// Framer provides React and its own modules at runtime; everything else is inlined, so a Framer project loads this one
// file (dist/index.js, typically from jsDelivr).
const providedByFramer = [/^react($|\/)/, /^react-dom($|\/)/, /^framer($|\/)/, /^framer-motion($|\/)/];

const librarySources: Record<string, string> = {
    "@viamedici-spc/configurator-framer": new URL("../configurator-framer/src/index.ts", import.meta.url).pathname,
};

// While watching, the bundle builds the library from its sources, so a change to either rebuilds the bundle; the build
// writes no package.json then.
const config: UserConfigFn = defineConfig(inlineConfig => ({
    entry: ["src/index.ts"],
    format: "esm",
    platform: "browser",
    target: "es2022",
    minify: true,
    deps: {
        neverBundle: providedByFramer,
        onlyBundle: false,
        // The bundle may import only what Framer provides; anything else fails the build.
        onlyImport: providedByFramer,
    },
    // No declarations: Framer projects import the bundle by URL, where the editor gets no types; TypeScript projects
    // use @viamedici-spc/configurator-framer instead.
    dts: false,
    exports: !inlineConfig.watch,
    alias: inlineConfig.watch ? librarySources : {},
}));

export default config;