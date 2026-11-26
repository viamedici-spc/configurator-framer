import {defineConfig, type UserConfig} from "tsdown";

// Framer provides React and its own modules at runtime; everything else is inlined, so a Framer project loads this one
// file (dist/index.js, typically from jsDelivr).
const providedByFramer = [/^react($|\/)/, /^react-dom($|\/)/, /^framer($|\/)/, /^framer-motion($|\/)/];

const config: UserConfig = defineConfig({
    entry: ["src/index.ts"],
    format: "esm",
    platform: "browser",
    target: "es2022",
    minify: true,
    deps: {
        neverBundle: providedByFramer,
        onlyBundle: false,
    },
    // No declarations: Framer projects import the bundle by URL, where the editor gets no types; TypeScript projects
    // use @viamedici-spc/configurator-framer instead.
    dts: false,
    exports: true,
});

export default config;