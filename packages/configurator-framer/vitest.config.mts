import {defineConfig} from "vitest/config";

export default defineConfig({
    test: {
        environment: "jsdom",
        // fp-ts 2.x ships ES modules that Node cannot load; Vite transforms these packages instead (README).
        server: {deps: {inline: [/fp-ts/, /@viamedici-spc\//]}},
    },
});
