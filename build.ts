// @ts-ignore
import fs from 'fs'

// @ts-ignore
const result = await Bun.build({
    entrypoints: ["./src/main.ts"],
    outdir: "./dist",
});

fs.cpSync('./public', './dist', {recursive: true});

if (!result.success) {
    console.error("Build failed");
    for (const message of result.logs) {
        // Bun will pretty print the message object
        console.error(message);
    }
}