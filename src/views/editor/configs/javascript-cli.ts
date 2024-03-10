import {WebContainer, WebContainerProcess} from "@webcontainer/api";
import {htmlBody, mergePackageJSON} from "./helper.ts";

export default {
    name: 'Typescript-CLI',
    icon: 'brand-javascript',
    descriptions: ``,
    async initContainer(config: any, files: any[], sh: WebContainerProcess, webContainer: WebContainer, input: WritableStreamDefaultWriter) {
        await webContainer.fs.writeFile('package.json', JSON.stringify(await mergePackageJSON({}, webContainer)))

        await input.write(`npm install && node ${config.main || 'app.js'}\n`)
    },
    createNewFiles: () => [
    {
            name: 'main.js',
            contents: `console.log('Hello World')`
        },
        {
            name: '.codebox',
            contents: `{
    "type": "javascript-cli",
    "main": "main.js"
}`
        }
    ]
}