import {defineConfig, type Rolldown, type UserConfigFn} from "tsdown";

/**
 * fp-ts 2.x has no `exports` map, so strict ESM resolution (webpack 5 for a `"type": "module"` package) rejects
 * `fp-ts/Ordering`. The JavaScript output therefore imports fp-ts' ES modules by full file path; the declarations keep
 * the usual paths.
 */
const fullySpecifiedFpTs: Rolldown.Plugin = {
    name: "fully-specified-fp-ts",
    resolveId: {
        order: "pre",
        handler(source, importer) {
            if (importer?.endsWith(".d.ts")) {
                return null;
            }
            const match = /^fp-ts(?:\/(?:lib|es6))?(?:\/([^/]+?))?(?:\.js)?$/.exec(source);
            return match ? {id: `fp-ts/es6/${match[1] ?? "index"}.js`, external: true} : null;
        },
    },
};

// A watch build writes no package.json.
const config: UserConfigFn = defineConfig(inlineConfig => ({
    entry: ["src/index.ts"],
    format: "esm",
    platform: "browser",
    target: "es2022",
    dts: {generator: "tsgo"},
    exports: !inlineConfig.watch,
    // Every dependency stays external: a package bundled by accident fails the build.
    deps: {onlyBundle: []},
    plugins: [fullySpecifiedFpTs],
}));

export default config;