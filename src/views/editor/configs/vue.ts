import {WebContainer, WebContainerProcess} from "@webcontainer/api";

export default {
    name: 'Vue',
    icon: 'brand-vue',
    descriptions: ``,
    async initContainer(config: any, files: any[], sh: WebContainerProcess, webContainer: WebContainer, input: WritableStreamDefaultWriter) {
        if (!files.find(f => f.name === 'index.html')) {
            await webContainer.fs.writeFile('index.html', `
            <!doctype html>
            <html lang="en">
            <head>
            <meta charset="UTF-8">
                 <meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
                 <meta http-equiv="X-UA-Compatible" content="ie=edge">
                 <title>Pastefy-Codebox</title>
            </head>
            <body>
                <div id="app"></div>
                <script type="module" src="${config.main ?? 'main.js'}"></script>
            </body>
            </html>
        `)
        }
        if (!files.find(f => f.name === 'vite.config.js')) {
            await webContainer.fs.writeFile('vite.config.js', `
            import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
})
`)
        }

        await webContainer.fs.writeFile('package.json', JSON.stringify({
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
                "vite": "^5.1.4",
                "@vitejs/plugin-vue": "^5.0.4",
            }
        }))

        await input.write('npm install && npm run dev\n')
    },
    createNewFiles: () => [
        {
            name: 'App.vue',
            contents: `<script setup>
console.log('Hello World')
</script>

<template>
  <div>
    <h1>Example Vue!</h1>
  </div>
</template>

<style scoped>
h1 {
    color: #439999
}
</style>`
        },
        {
            name: 'main.js',
            contents: `import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')`
        },
        {
            name: '.codebox',
            contents: `{
    "type": "vue",
    "main": "main.js"
}`
        }
    ]
}