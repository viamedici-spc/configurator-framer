import {defineConfig} from "vite";
import checker from "vite-plugin-checker";
import dts from "vite-plugin-dts";

export default defineConfig(() => {
    return ({
        build: {
            outDir: "dist",
            minify: true,
            emptyOutDir: true,
            lib: {
                entry: "src/index.ts",
                formats: ["es", "cjs"],
                name: "configurator",
                // We don't have ESM spec conform package because of fp-ts dependency.
                // So we can't let Vite name the ESM package .mjs because it would break compatibility with webpack.
                // Webpacks expects a fully spec conform package for a .mjs package. Node.js would be happy with this.
                // That's the reason why we don't specify type = "module". This would also break Node.js than because of directory imports.
                fileName: (format, entry) => entry + "." + (format === "es" ? "js" : format === "cjs" ? "cjs" : "XXX")
            },
            rollupOptions: {
                // Externalize dependencies which already come with Framer
                external: ["react", /^react\/.*/, /^react-dom.*/, /^framer.*/]
            },
        },
        plugins: [
            checker({typescript: true}),
            dts({rollupTypes: true})
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
        }
    });
});