import {WebContainer, WebContainerProcess} from "@webcontainer/api";

export default {
    name: 'JDOM-Template',
    icon: 'letter-j-small',
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
            "dependencies": {
                "jdomjs": "3.1.11"
            },
            "devDependencies": {
                "vite": "^5.1.4"
            }
        }))

        await input.write('npm install && npm run dev\n')
    },
    createNewFiles: () => [
        {
            name: 'MyApp.js',
            contents: `import { html, css, JDOMComponent, $r, state } from 'jdomjs'

export default class MyApp extends JDOMComponent {
    count = state(0)

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
}

$r('my-app', MyApp)`
        },
        {
            name: 'main.js',
            contents: `import { html } from 'jdomjs'
import MyApp from './MyApp.js'

html\`<\${MyApp} />\`.appendTo(document)`
        },
        {
            name: '.codebox',
            contents: `{
    "type": "jdom-template-app",
    "main": "main.js"
}`
        }
    ]
}