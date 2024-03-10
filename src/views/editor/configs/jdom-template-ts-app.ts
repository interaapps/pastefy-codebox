import {WebContainer, WebContainerProcess} from "@webcontainer/api";
import {createTSConfig, htmlBody, mergePackageJSON} from "./helper.ts";

export default {
    name: 'JDOM-Template TS',
    icon: 'letter-j-small',
    descriptions: ``,
    async initContainer(config: any, files: any[], sh: WebContainerProcess, webContainer: WebContainer, input: WritableStreamDefaultWriter) {
        if (!files.find(f => f.name === 'index.html')) {
            await webContainer.fs.writeFile('index.html', htmlBody(`<script type="module" src="${config.main ?? 'main.ts'}"></script>`))
        }

        if (!files.find(f => f.name === 'tsconfig.json')) {
            await webContainer.fs.writeFile('tsconfig.json', createTSConfig())
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
            "dependencies": {
                "jdomjs": "3.1.11"
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
            name: 'MyApp.ts',
            contents: `import { html, css, JDOMComponent, $r, state } from 'jdomjs'
import { CustomElement } from 'jdomjs/src/decorators.ts'

@CustomElement('my-app')
export default class MyApp extends JDOMComponent {
    count = state<number>(0)

    render() { 
        return html\`
            <h1>My JDOM App</h1>
            <button @click=\${() => this.count.value++}>Count is \${this.count}</button>
        \`
    }
    
    styles() {
        return css\`
            * {
                font-family: sans-serif
            }
        \`
    }
}`
        },
        {
            name: 'main.ts',
            contents: `import { html } from 'jdomjs'
import MyApp from './MyApp.ts'

html\`<\${MyApp} />\`.appendTo(document)`
        },
        {
            name: '.codebox',
            contents: `{
    "type": "jdom-template-ts-app",
    "main": "main.ts"
}`
        }
    ]
}