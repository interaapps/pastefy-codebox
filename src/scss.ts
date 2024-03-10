import { compileString } from 'sass'

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
    return compileString(out).css
}