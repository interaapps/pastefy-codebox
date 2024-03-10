import {WebContainer, WebContainerProcess} from "@webcontainer/api";
import {createTSConfig, htmlBody, mergePackageJSON} from "./helper.ts";

export default {
    name: 'Typescript-Web',
    icon: 'brand-typescript',
    descriptions: ``,
    async initContainer(config: any, files: any[], sh: WebContainerProcess, webContainer: WebContainer, input: WritableStreamDefaultWriter) {
        if (!files.find(f => f.name === 'index.html')) {
            await webContainer.fs.writeFile(
                'index.html',
                htmlBody(`<script type="module" src="${config.main ?? 'main.ts'}"></script>`)
            )
        }

        if (!files.find(f => f.name === 'tsconfig.json')) {
            await webContainer.fs.writeFile('tsconfig.json', createTSConfig())
        }

        await webContainer.fs.writeFile('package.json', JSON.stringify(await mergePackageJSON({
            "scripts": {
                "dev": "vite",
                "build": "tsc && vite build",
                "preview": "vite preview"
            },
            "devDependencies": {
                "typescript": "^5.2.2",
                "vite": "^5.1.4"
            }
        }, webContainer)))

        await input.write('npm install && npm run dev\n')
    },
    createNewFiles: () => [
        {
            name: 'main.ts',
            contents: `document.body.appendChild(document.createTextNode('Hello World!'))`
        },
        {
            name: '.codebox',
            contents: `{
    "type": "typescript-web",
    "main": "main.ts"
}`
        }
    ]
}