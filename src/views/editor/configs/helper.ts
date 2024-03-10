import {WebContainer} from "@webcontainer/api";

export function isObject(item: any) {
    return (item && typeof item === 'object' && !Array.isArray(item));
}

export function mergeDeep(target: any, ...sources: any) {
    if (!sources.length) return target;
    const source = sources.shift();

    if (isObject(target) && isObject(source)) {
        for (const key in source) {
            if (isObject(source[key])) {
                if (!target[key]) Object.assign(target, { [key]: {} });
                mergeDeep(target[key], source[key]);
            } else {
                Object.assign(target, { [key]: source[key] });
            }
        }
    }

    return mergeDeep(target, ...sources);
}

export async function mergePackageJSON(merge: any, webContainer: WebContainer): Promise<any> {
    let packageJson = {
        "name": "testvite1",
        "private": true,
        "version": "0.0.0",
        "type": "module",
    }

    let adds = []

    try {
        const f = await webContainer.fs.readFile('package.json')
        adds.push(JSON.parse(new TextDecoder().decode(f)))
    } catch (e) {}

    adds.push(merge)
    return mergeDeep(packageJson, ...adds)
}

export function htmlBody(body = '', head = '') {
    return `<!doctype html>
            <html lang="en">
            <head>
            <meta charset="UTF-8">
                 <meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
                 <meta http-equiv="X-UA-Compatible" content="ie=edge">
                 <title>Pastefy-Codebox</title>
                ${head}
            </head>
            <body>
                ${body}
            </body>
            </html>`
}
export function createTSConfig(): string {
    return `{
"compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,
    "experimentalDecorators": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["."]
}`
}