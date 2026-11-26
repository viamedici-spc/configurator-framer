// Serves dist/ on http://localhost:3000 for a Framer project that imports http://localhost:3000/index.js during
// development; Framer loads it cross-origin.
const root = new URL("./dist/", import.meta.url);

Bun.serve({
    port: 3000,
    async fetch(request) {
        const path = new URL(request.url).pathname.replace(/^\/+/, "") || "index.js";
        const file = Bun.file(new URL(path, root));
        return (await file.exists())
            ? new Response(file, {headers: {"Access-Control-Allow-Origin": "*", "Cache-Control": "no-store"}})
            : new Response("Not found", {status: 404});
    },
});

console.log("Serving dist/ on http://localhost:3000/index.js");