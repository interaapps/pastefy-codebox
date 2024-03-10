import {htmlBody} from "./helper.ts";

export default {
    name: 'HTML-CSS-JS',
    icon: 'brand-html5',
    descriptions: ``,
    createNewFiles: () => [
        {
            name: 'index.html',
            contents: htmlBody(`<h1>My Site!</h1>
    <button id="button">Count is 0</button>
    
    <script src="/index.js"></script>`, `<link rel="stylesheet" href="/styles.css">`)
        },
        {
            name: 'index.js',
            contents: `const button = document.querySelector('#button')
            
let count = 0
button.addEventListener('click', () => {
    button.textContent = \`Count is \${++count}\`
})
`
        },
        {
            name: 'styles.css',
            contents: `* {
    font-family: sans-serif;
}`
        },
        {
            name: '.codebox',
            contents: `{
    "type": "javascript-web"
}`
        }
    ]
}