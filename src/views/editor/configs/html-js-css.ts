export default {
    name: 'HTML-CSS-JS',
    icon: 'brand-html5',
    descriptions: ``,
    createNewFiles: () => [
        {
            name: 'index.html',
            contents: `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8">
             <meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
                         <meta http-equiv="X-UA-Compatible" content="ie=edge">
             <title>Document</title>
</head>
<body>
    <h1>Hi</h1>
    
     <script src="/index.js"></script>
</body>
</html>`
        },
        {
            name: 'index.js',
            contents: `document.querySelector('h1').textContent = 'Hello World!'`
        },
        {
            name: 'styles.css',
            contents: `* {
    font-family: sans-serif;
    margin: 0;
    padding: 0;
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