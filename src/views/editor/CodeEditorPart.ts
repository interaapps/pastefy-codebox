import {css, Hook, html, JDOMComponent, state} from 'jdomjs'

import {CustomElement, State} from 'jdomjs/src/decorators.ts'

import { CodeEditor } from 'petrel/index.js'
import { JavaScriptAutoComplete, DockerfileAutoComplete, HTMLAutoComplete, JSONAutoComplete, JavaAutoComplete, MarkdownAutoComplete, PHPAutoComplete, SQLAutoComplete, YAMLAutoComplete } from 'petrel/autocompletions.js'
import hljs from 'highlight.js'
import LANGUAGE_REPLACEMENTS from './langReplacements.ts'
const LANGUAGES = hljs.listLanguages()

const AUTOCOMPLETIONS = [
    {language: "javascript", file: JavaScriptAutoComplete},
    {language: "dockerfile", file: DockerfileAutoComplete},
    {language: "html", file: HTMLAutoComplete},
    {language: "json", file: JSONAutoComplete},
    {language: "java", file: JavaAutoComplete},
    {language: "markdown", file: MarkdownAutoComplete},
    {language: "php", file: PHPAutoComplete},
    {language: "sql", file: SQLAutoComplete},
    {language: "yaml", file: YAMLAutoComplete},
]
const DEFAULT_HIGHLIGHTER = v => v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;")

@CustomElement("editor-editor-part")
export default class CodeEditorPart extends JDOMComponent {
    @State()
    selected = state<any>({})

    codeEditor = new CodeEditor(null)

    currentLanguage = ''

    selectListener = null

    timer: number = null

    constructor() {
        super({
            shadowed: false
        });
    }

    detach() {
        if (this.timer !== null) {
            clearInterval(this.timer)
        }
    }

    updateEditorLang() {
        console.log('huh', this.selected.value.name)
        if (!this.selected.value.name || (this.selected.value.name instanceof Hook))
            return;
        let language;
        const split = this.selected.value.name.split(".")
        let isHTML = false
        if (split.length > 1) {
            language = split[split.length - 1]
            if (language == "html" || language == "htm")
                isHTML = true

            for (const name in LANGUAGE_REPLACEMENTS) {
                if (language == name) {
                    language = LANGUAGE_REPLACEMENTS[name]
                    break;
                }
            }
        } else if (split[0] == 'Dockerfile')
            language = 'dockerfile'


        if (this.currentLanguage != language) {
            this.currentLanguage = language
            if (LANGUAGES.includes(language)) {
                this.codeEditor.setHighlighter(c => hljs.highlight(language, c).value)

                this.codeEditor.setAutoCompleteHandler(null)
                for (const autocompletion of AUTOCOMPLETIONS) {
                    if (autocompletion.language == language || (autocompletion.language == "html" && isHTML)) {
                        (async () => {
                            this.codeEditor.setAutoCompleteHandler(new autocompletion.file)
                        })()
                    }
                }
            }
            this.codeEditor.update()
        }


        if (this.codeEditor.value.length > 7000) {
            this.codeEditor.setAutoCompleteHandler(null)
            if (this.codeEditor.value.length > 11000) {
                this.codeEditor.setHighlighter(DEFAULT_HIGHLIGHTER)
            }
        }
    }

    dettach() {
        this.selected.removeListener(this.selectListener)
    }

    render() {
        const element = document.createElement('div')
        this.codeEditor.parentElement = element

        this.selectListener = this.selected.addListener(v => {
            this.updateEditorLang()
            if (this.codeEditor.value !== v.contents) {
                this.codeEditor.setValue(v.contents)
            }
        })

        let changed = false
        this.codeEditor.textAreaElement.addEventListener('keydown', (e: KeyboardEvent) => {
            if (e.key === 's' && (e.ctrlKey || e.metaKey)) {
                this.dispatchEvent(new CustomEvent('save_paste'))
                e.stopPropagation()
                e.preventDefault()
            }
        })
        this.codeEditor.textAreaElement.addEventListener('keyup', e => {
            this.selected.value.contents = this.codeEditor.value
            changed = true
        })

        this.timer = setInterval(() => {
            if (changed) {
                this.dispatchEvent(new CustomEvent('changed'))
                changed = false
            }
        }, 1000)

        this.codeEditor.setHighlighter(code => hljs.highlight("javascript", code).value)
        if (this.selected.value.contents)
            this.codeEditor.setValue(this.selected.value.contents)

        setTimeout(() => this.codeEditor.update(), 200)

        this.codeEditor.setAutoCompleteHandler(new JavaScriptAutoComplete())
        this.codeEditor.create()
        this.updateEditorLang()

        return html`${ element }`
    }

    styles(): string {
        return css`
            .petrel-code-editor {
                height: calc(100% - 40px);
            }
        `;
    }
}