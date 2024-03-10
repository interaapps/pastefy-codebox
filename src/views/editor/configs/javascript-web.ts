import {WebContainer, WebContainerProcess} from "@webcontainer/api";
import {mergePackageJSON} from "./helper.ts";

export default {
    name: 'Typescript-Web',
    icon: 'brand-javascript',
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
                <script type="module" src="${config.main ?? 'main.js'}"></script>
            </body>
            </html>
        `)
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
                "vite": "^5.1.4"
            }
        }, webContainer)))

        await input.write('npm install && npm run dev\n')
    },
    createNewFiles: () => [
        {
            name: 'main.js',
            contents: `document.body.appendChild(document.createTextNode('Hello World!'))`
        },
        {
            name: '.codebox',
            contents: `{
    "type": "javascript-web",
    "main": "main.js"
}`
        }
    ]
}