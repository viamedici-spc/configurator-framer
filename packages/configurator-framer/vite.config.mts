import {defineConfig} from "vite";
import checker from "vite-plugin-checker";
import dts from "vite-plugin-dts";

const alwaysExternalize = ["react", /^react\/.*/, /^react-dom.*/, /^framer.*/];

/*
    During development additional dependencies should not be externalized because there is no instance to create the required import map.
    At production JSPM creates the important map, so we can externalize all dependencies.
*/
const productionExternalize = [...alwaysExternalize, /^@viamedici-spc.*/, /^ts-pattern.*/, /^styled-components.*/, /^fp-ts.*/, /^dyna-guid.*/, /^@fortawesome.*/,
    /^react-error-boundary.*/, /^react-number-format.*/, /^use-debounce.*/, /^clsx.*/, /^hex-to-css-filter.*/, /^rgb-hex.*/, /^merge-props.*/];

export default defineConfig(({command, mode, ssrBuild}) => {
    const isProduction = mode === "production";
    return ({
        build: {
            outDir: "dist",
            minify: isProduction,
            emptyOutDir: true,
            lib: {
                entry: "src/index.ts",
                formats: isProduction ? ["es", "cjs"] : ["es"],
                name: "configurator",
                // We don't have ESM spec conform package because of fp-ts dependency.
                // So we can't let Vite name the ESM package .mjs because it would break compatibility with webpack.
                // Webpacks expects a fully spec conform package for a .mjs package. Node.js would be happy with this.
                // That's the reason why we don't specify type = "module". This would also break Node.js than because of directory imports.
                fileName: (format, entry) => entry + "." + (format === "es" ? "js" : format === "cjs" ? "cjs" : "XXX")
            },
            rollupOptions: {
                // make sure to externalize deps that shouldn't be bundled into your library
                external: isProduction ? productionExternalize : alwaysExternalize,
                treeshake: isProduction ? "recommended": false
            },
        },
        plugins: [
            checker({typescript: true}),
            ...(isProduction ? [dts({rollupTypes: true})] : [])
        ],
        test: {
            environment: "jsdom",
            reporters: ["default", "junit"],
            outputFile: './report/tests-results.xml',
            coverage: {
                provider: "istanbul",
                reporter: "cobertura",
                reportsDirectory: "report",
                enabled: true
            }
        },
        preview: {
            port: 3000
        }
    });
});