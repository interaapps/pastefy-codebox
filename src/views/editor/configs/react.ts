import {WebContainer, WebContainerProcess} from "@webcontainer/api";
import {mergePackageJSON} from "./helper.ts";

export default {
    name: 'React',
    icon: 'brand-react',
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
                <div id="root"></div>
                <script type="module" src="${config.main ?? 'main.jsx'}"></script>
            </body>
            </html>
        `)
        }
        if (!files.find(f => f.name === 'vite.config.js')) {
            await webContainer.fs.writeFile('vite.config.js', `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
})`)
        }
        if (!files.find(f => f.name === 'main.jsx')) {
            await webContainer.fs.writeFile('main.jsx', `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from ${config.component || './App.jsx'}
${files.find(f => f.name === 'styles.css') ? "import './styles.css'" : ''}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)`)
        }
        if (!files.find(f => f.name === '.eslint.cjs')) {
            await webContainer.fs.writeFile('.eslint.cjs', `module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  settings: { react: { version: '18.2' } },
  plugins: ['react-refresh'],
  rules: {
    'react/jsx-no-target-blank': 'off',
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
  },
}`)
        }

        await webContainer.fs.writeFile('package.json', JSON.stringify(await mergePackageJSON({
            "name": "testvite1",
            "private": true,
            "version": "0.0.0",
            "type": "module",
            "scripts": {
                "dev": "vite",
                "build": "vite build",
                "lint": "eslint . --ext js,jsx --report-unused-disable-directives --max-warnings 0",
                "preview": "vite preview"
            },
            "dependencies": {
                "react": "^18.2.0",
                "react-dom": "^18.2.0"
            },
            "devDependencies": {
                "@types/react": "^18.2.56",
                "@types/react-dom": "^18.2.19",
                "@vitejs/plugin-react": "^4.2.1",
                "eslint": "^8.56.0",
                "eslint-plugin-react": "^7.33.2",
                "eslint-plugin-react-hooks": "^4.6.0",
                "eslint-plugin-react-refresh": "^0.4.5",
                "vite": "^5.1.4"
            }
        }, webContainer)))

        await input.write('npm install && npm run dev\n')
    },
    createNewFiles: () => [
        {
            name: 'App.jsx',
            contents: `import { useState } from 'react'

function App() {
    const [count, setCount] = useState(0)
    
    return (
        <>
            <h1>React!</h1>
            <div className="card">
                <button onClick={() => setCount((count) => count + 1)}>
                    count is {count}
                </button>
                <p>
                    Edit <code>App.jsx</code> and save to test HMR
                </p>
            </div>
        </>
    )
}

export default App`
        },
        {
            name: 'main.jsx',
            contents: `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles.css'

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
)`
        },
        {
            name: 'styles.css',
            contents: `* {
    font-family: sans-serif
}

h1 {
    color: #4444AA 
}`,
        },
        {
            name: '.codebox',
            contents: `{
    "type": "react",
    "main": "main.jsx"
}`
        }
    ]
}