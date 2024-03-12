// @ts-ignore
import fs from 'fs'
import { compile } from 'sass'

// @ts-ignore
const result = await Bun.build({
    entrypoints: ["./src/main.ts"],
    outdir: "./dist",
    minify: {
        whitespace: true,
        syntax: true,
    },
});

// @ts-ignore
Bun.write('dist/index.css', compile('src/assets/main.scss').css)

fs.cpSync('./public', './dist', {recursive: true});

if (!result.success) {
    console.error("Build failed");
    for (const message of result.logs) {
        // Bun will pretty print the message object
        console.error(message);
    }
}