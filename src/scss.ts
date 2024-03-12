import { compileString } from 'sass'

const saved = {}

function hash(str) {
    let hash = 0, i, chr;
    if (str.length === 0) return hash;
    for (i = 0; i < str.length; i++) {
        chr = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0;
    }
    return hash;
}

export function scss(strings, ...values) {
    let out = ''
    let i = 0
    for (const str of strings) {
        out += str
        if (values[i]) {
            out += values[i]
            i++
        }
    }

    const hashed = hash(out)
    if (!saved[hashed]) {
        saved[hashed] = compileString(out).css
    }

    return saved[hashed]
}