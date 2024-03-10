import { Hono } from "hono";
import { serveStatic } from "hono/bun";

const app = new Hono()

app.get('/dmmono/*', serveStatic({ root: './dist/dmmono', }))

app.get('*', (r, b) => {
    r.header('Cross-Origin-Opener-Policy', 'same-origin');
    r.header('Cross-Origin-Embedder-Policy', 'require-corp');
    r.header('Cross-Origin-Resource-Policy', 'cross-origin');

    return serveStatic({ root: './dist',})(r, b)
})

app.get('*', (r, b) => {
    r.header('Cross-Origin-Opener-Policy', 'same-origin');
    r.header('Cross-Origin-Embedder-Policy', 'require-corp');
    r.header('Cross-Origin-Resource-Policy', 'cross-origin');

    return serveStatic({
        path: './dist/index.html',
    })(r, b)
})


Bun.serve({
    port: 8000,
    fetch: app.fetch
})