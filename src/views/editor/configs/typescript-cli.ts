import {WebContainer, WebContainerProcess} from "@webcontainer/api";
import {htmlBody, mergePackageJSON} from "./helper.ts";

export default {
    name: 'Typescript-CLI',
    icon: 'brand-typescript',
    descriptions: ``,
    async initContainer(config: any, files: any[], sh: WebContainerProcess, webContainer: WebContainer, input: WritableStreamDefaultWriter) {
        await webContainer.fs.writeFile('package.json', JSON.stringify(await mergePackageJSON({
            "type": undefined,
            "devDependencies": {
                "typescript": "^5.2.2"
            }
        }, webContainer)))

        await input.write(`npm install && npx -y ts-node ${config.main || 'app.ts'}\n`)
    },
    createNewFiles: () => [
        {
            name: 'main.ts',
            contents: `console.log('Hello World')`
        },
        {
            name: '.codebox',
            contents: `{
    "type": "typescript-cli",
    "main": "main.ts"
}`
        }
    ]
}