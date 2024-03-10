import {WebContainer, WebContainerProcess} from "@webcontainer/api";
import {htmlBody, mergePackageJSON} from "./helper.ts";

export default {
    name: 'Svelte',
    icon: 'brand-svelte',
    descriptions: ``,
    async initContainer(config: any, files: any[], sh: WebContainerProcess, webContainer: WebContainer, input: WritableStreamDefaultWriter) {
        if (!files.find(f => f.name === 'index.html')) {
            await webContainer.fs.writeFile('index.html', htmlBody(`<div id="app"></div>
<script type="module" src="${config.main ?? 'main.js'}"></script>`))
        }
        if (!files.find(f => f.name === 'vite.config.js')) {
            await webContainer.fs.writeFile('vite.config.js', `
            import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svelte()],
})
`)
        }

        if (!files.find(f => f.name === 'svelte.config.js')) {
            await webContainer.fs.writeFile('svelte.config.js', `import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'
export default {
  preprocess: vitePreprocess(),
}`)
        }

        await webContainer.fs.writeFile('package.json', JSON.stringify(await mergePackageJSON({
            "name": "testvite1",
            "private": true,
            "version": "0.0.0",
            "type": "module",
            "scripts": {
                "dev": "vite",
                "build": "tsc && vite build",
                "preview": "vite preview"
            },
            "devDependencies": {
                "@sveltejs/vite-plugin-svelte": "^3.0.2",
                "svelte": "^4.2.11",
                "vite": "^5.1.4"
            }
        }, webContainer)))

        await input.write('npm install && npm run dev\n')
    },
    createNewFiles: () => [
        {
            name: 'App.svelte',
            contents: `<script>
let count = 0
const increment = () => {
    count += 1
}
</script>

<main>
    <h1>Svelte</h1>
    
    <div class="card">
        <button on:click={increment}>
            count is {count}
        </button>
    </div>
</main>

<style>
* {
    font-family: sans-serif
}
</style>`
        },
        {
            name: 'main.js',
            contents: `import App from './App.svelte'

const app = new App({
    target: document.getElementById('app'),
})

export default app`
        },
        {
            name: '.codebox',
            contents: `{
    "type": "svelte",
    "main": "main.js"
}`
        }
    ]
}