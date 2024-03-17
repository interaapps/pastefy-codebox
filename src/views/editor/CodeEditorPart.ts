import {css, Hook, html, JDOMComponent, state} from 'jdomjs'

import {CustomElement, State} from 'jdomjs/src/decorators.ts'

import { CodeEditor } from 'petrel/index.js'
import { JavaScriptAutoComplete, DockerfileAutoComplete, HTMLAutoComplete, JSONAutoComplete, JavaAutoComplete, MarkdownAutoComplete, PHPAutoComplete, SQLAutoComplete, YAMLAutoComplete } from 'petrel/autocompletions.js'
import emmet from 'petrel/src/plugins/emmet.js'
import hljs from 'highlight.js'
import LANGUAGE_REPLACEMENTS from './langReplacements.ts'
import importHelper from "./importHelper.ts";
const LANGUAGES = hljs.listLanguages()

const AUTOCOMPLETIONS = [
    {language: "javascript", file: JavaScriptAutoComplete},
    {language: "typescript", file: JavaScriptAutoComplete},
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

    @State()
    files = state<any[]>([])

    codeEditor = new CodeEditor(null)

    currentLanguage = ''

    selectListener = null

    timer: number = null

    lastName: string = null
    deleteEmmetPlugin: any = null

    constructor() {
        super({
            shadowed: false
        });


        const userAgent = window.navigator.userAgent.toLowerCase()
        if ((userAgent.includes('iphone') || userAgent.includes('ipad')) && userAgent.includes('safari')) {
            this.codeEditor.textAreaElement.style.opacity = '1'
        }
    }

    detach() {
        this.selected.removeListener(this.selectListener)
        if (this.timer !== null) {
            clearInterval(this.timer)
        }
    }

    updateEditorLang() {
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
                console.log({ language })

                if (language === 'xml' && (
                    this.selected.value?.name.endsWith('.vue')
                    || this.selected.value?.name.endsWith('.svelte')
                )) {
                        this.codeEditor.setAutoCompleteHandler(new JavaScriptAutoComplete())
                } else {
                    for (const autocompletion of AUTOCOMPLETIONS) {
                        if (autocompletion.language == language || (autocompletion.language == "html" && isHTML)) {
                            this.codeEditor.setAutoCompleteHandler(new autocompletion.file())
                        }
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

    async updateLanguageAutocompletions() {
        console.log('Setting autocompletions')
        if (this.codeEditor.autoCompleteHandler instanceof JavaScriptAutoComplete) {
            this.codeEditor.autoCompleteHandler.importScripts = []
            this.files.value
                ?.filter(f => f.name !== this.selected.value.name)
                ?.filter(f => f.name.endsWith('.js') || f.name.endsWith('.jsx'))
                ?.forEach(f => {
                    const fHandler = new JavaScriptAutoComplete({ disableAutoLoad: true })
                    fHandler.analyseCode(f.contents)
                    this.codeEditor.autoCompleteHandler.importScripts.push(
                        {
                            file: './'+f.name,
                            analysed: fHandler.analysed
                        }
                    )
                })

            this.files.value
                ?.filter(f => f.name !== this.selected.value.name)
                ?.filter(f => f.name.endsWith('.svelte') || f.name.endsWith('.vue'))
                ?.forEach(f => {
                    const fHandler = new JavaScriptAutoComplete({ disableAutoLoad: true })
                    fHandler.analyseCode(f.contents)
                    this.codeEditor.autoCompleteHandler.importScripts.push(
                        {
                            file: './'+f.name,
                            analysed: {
                                defaultExport: f.name.replace('.vue', '').replace('.svelte', ''),
                                exports: []
                            }
                        }
                    )
                })

            this.codeEditor.autoCompleteHandler.importScripts.push(...importHelper)
        }
    }

    render() {
        const element = document.createElement('div')
        this.codeEditor.parentElement = element
        emmet(this.codeEditor, {
            preventer: () => {
                console.log(this.codeEditor.autoCompleteHandler instanceof HTMLAutoComplete)
                return !(
                    this.codeEditor.autoCompleteHandler instanceof HTMLAutoComplete
                    || this.selected.value?.name?.endsWith('.vue')
                    || this.selected.value?.name?.endsWith('.svelte')
                    || this.selected.value?.name?.endsWith('.jsx')
                    || this.selected.value?.name?.endsWith('.tsx')
                )
            }
        })

        this.selectListener = this.selected.addListener(v => {
            this.updateEditorLang()
            if (this.lastName !== v.name) {
                this.updateLanguageAutocompletions()
                this.lastName = v.name
            }
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
        this.updateLanguageAutocompletions()

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