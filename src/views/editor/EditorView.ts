import {computed, css, html, JDOMComponent, state} from 'jdomjs'

import {Attribute, Computed, CustomElement, State, Watch} from 'jdomjs/src/decorators.ts'
import { Awaiting, ForEach } from 'jdomjs/src/template/helper/components.js'
import {api, router} from "../../main.ts";
import { WebContainer } from '@webcontainer/api';
import {Terminal} from "@xterm/xterm";
import CodeEditorPart from "./CodeEditorPart.ts";
import {login, user} from "../../user.ts";
import configs from "./configs";
import Logo from "../../components/Logo.ts";
import UserProfile from "../../components/UserProfile.ts";
import TopBar from "../../components/TopBar.ts";
import {scss} from "../../scss.ts";
import LoadingIndicator from "../../components/LoadingIndicator.ts";


@CustomElement("editor-view")
export default class EditorView extends JDOMComponent.unshadowed {
    webContainer: WebContainer
    frame: HTMLIFrameElement
    frameURL = state<string>('')
    files = state<any[]>([])
    paste = state<any>({})
    pasteNameEdit = state('')
    selectedFile = state<any>({})
    selectedTabIndex = state(0)
    previewShown = state(false)
    fullscreen = state(false)
    loading = state(false)
    previewLoading = state(false)
    terminalLoading = state(false)
    containerError = state(false)
    savedIndicator = state(false)

    terminal: Terminal = new Terminal({
        convertEol: true,
        rows: 10,
        cols: 120,
        theme: {
            background: '#161921'
        }
    })

    async getPaste(id: string) {
        if (id === 'new') {
            this.pasteNameEdit.value = 'New Paste'

            let newType = router.currentRoute.value?.query?.type || 'html-js-css'

            if (!configs[newType])
                newType = 'html-js-css'

            const config = configs[newType]

            this.paste.value = { exists: false }
            this.files.value = config.createNewFiles()

            this.selectedFile.value = {
                name: this.files.value[0].name,
                contents: this.files.value[0].contents
            }

            return {}
        }
        this.loading.value = true

        const paste = await api.get(`/paste/${id}`)

        const out = {...paste}

        if (paste.type === 'MULTI_PASTE') {
            out.parts = JSON.parse(paste.content)
            out.parts.sort((a, b) => {
                if (b.name === '.codebox') {
                    return -1
                }
                if (
                    a.name?.toLowerCase().startsWith('main.') ||
                    a.name?.toLowerCase().startsWith('index.') ||
                    a.name?.toLowerCase().startsWith('myapp.') ||
                    a.name?.toLowerCase().startsWith('app.')
                ) {
                    if (b.name === 'index.html') {
                        return -2
                    }
                    return -1
                }
                return 0
            })
            this.files.value = out.parts
        }

        if (this.files.value[0]) {
            this.selectedFile.value = {
                name: this.files.value[0].name,
                contents: this.files.value[0].contents
            }
        }

        this.paste.value = out
        this.pasteNameEdit.value = out.title
        this.loading.value = false
        document.title = `${out.title || 'Editor'} - Pastefy Codebox`
    }

    getFile(name) {
        return this.files.value.find(c => c.name === name)
    }

    async savePaste() {
        let configFile = this.getFile('.codebox')
        if (configFile) {
            try {
                configFile = JSON.parse(configFile.contents)
            } catch (e) {}
        }
        let configType = `codebox-type-${configFile?.type || 'unknown'}`

        const content = JSON.stringify(this.files.value)

        if (this.paste.value?.id) {
            await api.put(`/paste/${this.paste.value.id}`, {
                title: this.pasteNameEdit.value,
                tags: ['codebox', configType],
                content
            })
        } else {
            const { paste } = await api.post(`/paste`, {
                title: this.pasteNameEdit.value,
                type: 'MULTI_PASTE',
                tags: ['codebox', configType],
                content
            })

            this.paste.value = paste
            window.history.pushState(`/${paste.id}`, `/${paste.id}`, `/${paste.id}`)
        }
        this.savedIndicator.value = true
        setTimeout(() => this.savedIndicator.value = false, 3000)
        document.title = `${this.paste.value?.title || 'Editor'} - Pastefy Codebox`
    }

    async initWebContainer() {
        this.terminalLoading.value = true
        this.webContainer?.teardown()

        console.log('STARTING WEBCONTAINER')
        this.webContainer = await WebContainer.boot();
        this.containerError.value = false
        this.webContainer.on('error', e => {
            this.containerError.value = true
        })

        for (const {name, contents} of this.files.value) {
            await this.webContainer.fs.writeFile(name, contents)
        }

        this.webContainer.on('server-ready', (port, url) => {
            this.previewLoading.value = true
            this.previewShown.value = true
            console.log('server ready', url, port)
            this.frame.src = url
            this.frameURL.value = url
            this.previewLoading.value = false
        });


        ;(async () => {
            const sh = await this.webContainer.spawn("sh")
            sh.output.pipeTo(new WritableStream({
                write: (data) => {
                    this.terminal.write(data)
                }
            }));

            const input = sh.input.getWriter();
            this.terminal.onData((data) => {
                input.write(data);
            });

            const configFile = this.files.value.find(s => s.name === '.codebox')?.contents
            if (configFile) {
                const config = JSON.parse(configFile)

                configs[config.type]?.initContainer(config, this.files.value, sh, this.webContainer, input)
            }
        })().then(r => null);
        this.terminalLoading.value = false
    }

    selectFile(index: number) {
        this.saveCurrent()
        this.selectedTabIndex.value = index
        this.selectedFile.value = {
            name: this.files.value[index].name,
            contents: this.files.value[index].contents,
        }
    }

    detach() {
        console.log('REMOVING CONTAINER')
        this.webContainer?.teardown()
    }

    removeFile(index: number) {
        this.files.value = this.files.value.filter((_, i) => i !== index)
        this.webContainer?.fs?.rm(this.files.value[index].name)

        if (this.selectedTabIndex.value === index) {
            this.selectFile((index - 1) || 0)
        }
    }

    saveCurrent() {
        if (this.selectedFile.value.name) {
            this.webContainer?.fs?.writeFile(this.selectedFile.value.name, this.selectedFile.value.contents)
        }
    }

    fork() {
        this.paste.value = {exists: false}
        window.history.pushState('/new', '/new', '/new')
    }

    keyDownSaveEvent(e: KeyboardEvent) {
        if (e.key === 's' && (e.ctrlKey || e.metaKey)) {
            this.savePaste()
            e.stopPropagation()
            e.preventDefault()
        }
    }

    render() {
        document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#1c202a')
        document.title = 'Editor - Pastefy Codebox'

        this.frame = document.createElement('iframe')
        const termDiv = document.createElement('div')
        termDiv.classList.add('terminal')
        this.terminal.open(termDiv)

        this.selectedFile.addListener(v => {
            this.files.value[this.selectedTabIndex.value] = v
        })

        this.getPaste(router.currentRoute.value.params.paste)
            .then(() => {
                this.initWebContainer()
            })

        return html`
            <div class="editor">
                <div class="top-bar">
                    <${Logo} />
                    
                    <div>
                        <input 
                            type="text" 
                            :bind=${this.pasteNameEdit} 
                            @keydown=${e => this.keyDownSaveEvent(e)}
                        >
                    </div>
                    
                    <div class="top-bar-buttons">
                        <button class="btn" @click=${() => this.fork()}>Fork</button>
                        <!-- <button @click=${() => open(`https://pastefy.app/${this.paste.value.id}`)}>Open in Pastefy</button>-->
                        ${computed(() => user.value?.id === this.paste.value?.user_id || !this.paste.value.exists
                            ? html`
                                <button class="btn primary" @click=${() => this.savePaste()}>
                                    ${computed(() => this.savedIndicator.value ? 'Saved' : 'Save', [this.savedIndicator])}
                                </button>`
                            : null,
                        [this.paste, user])}
                        
                        
                        <${UserProfile} />
                    </div>
                </div>
                <div class="editor-vertical" style=${{'grid-template-columns': computed(() => this.previewShown.value ? 'auto 25%' : 'auto', [this.previewShown])}}>
                    <div class="editor-code-editor-area">
                        <${LoadingIndicator} :if=${this.loading} />
                        
                        <button class="run-btn" @click=${() => this.initWebContainer()}>
                            <i class="ti ti-player-play" />
                        </button>
                        
                        <div class="editor-code-files">
                            <${ForEach}
                                value=${this.files}
                                content=${({name, contents}, index) => html`
                                    <button
                                        class=${{'files-tab': true, 'selected': computed(() => this.selectedTabIndex.value === index, [this.selectedTabIndex])}} 
                                        @click=${() => this.selectFile(index)}
                                    >
                                        <i 
                                            class=${[
                                                'ti',
                                                'file-icon',
                                                computed(() => {
                                                    if (this.files.value[index].name === '.codebox')
                                                        return 'ti-file-settings'
                                                    else if (this.files.value[index].name === 'tsconfig.json')
                                                        return 'ti-brand-typescript'
                                                    else if (this.files.value[index].name === 'package.json')
                                                        return 'ti-script'
                                                    else if (this.files.value[index].name.endsWith('.js') || this.files.value[index].name.endsWith('.mjs'))
                                                        return 'ti-brand-javascript'
                                                    else if (this.files.value[index].name.endsWith('.ts'))
                                                        return 'ti-brand-typescript'
                                                    else if (this.files.value[index].name.endsWith('.jsx') || this.files.value[index].name.endsWith('.tsx'))
                                                        return 'ti-brand-react'
                                                    else if (this.files.value[index].name.endsWith('.vue'))
                                                        return 'ti-brand-vue'
                                                    else if (this.files.value[index].name.endsWith('.svelte'))
                                                        return 'ti-brand-svelte'
                                                    else if (this.files.value[index].name.endsWith('.css') || this.files.value[index].name.endsWith('.scss'))
                                                        return 'ti-file-type-css'
                                                    else if (this.files.value[index].name.endsWith('.html'))
                                                        return 'ti-brand-html5'
                                                    else if (this.files.value[index].name.endsWith('.csv'))
                                                        return 'ti-file-type-csv'
                                                    else if (this.files.value[index].name.endsWith('.svg'))
                                                        return 'ti-file-vector'
                                                    else if (this.files.value[index].name.endsWith('.json'))
                                                        return 'ti-json'
                                                    return 'ti-file'
                                                }, [this.files])
                                            ]} 
                                        />
                                        <input
                                            value=${name}
                                            @click=${e => e.target.focus()}
                                            @keydown=${e => this.keyDownSaveEvent(e)}
                                            @change=${e => {
                                                this.webContainer?.fs?.rm(name)
                                                this.files.value[index].name = e.target.value
                                                this.webContainer?.fs?.writeFile(e.target.value, contents)
                                            }}
                                        />

                                        <i 
                                            class="ti ti-x icon-button"
                                            @click.stop=${() => this.removeFile(index)}
                                        />
                                    </button>
                                `}
                            />
                            
                            <button class="add-btn" @click=${() => this.files.value = [...this.files.value, {name: 'new-file', contents: ''}]}>
                                <i class="ti ti-plus" />
                            </button>
                        </div>
                        
                        <${CodeEditorPart} 
                                selected=${this.selectedFile} 
                                @changed=${() => this.saveCurrent()}
                                @save_paste=${() => this.savePaste()}
                        />
                    </div>
                    <div class=${{'editor-preview': true, fullscreen: this.fullscreen}} :if=${this.previewShown}>
                        <${LoadingIndicator} name="Preview" :if=${this.previewLoading} />
                        <div class="editor-preview-toolbar">
                            <i 
                                    class="ti ti-reload icon-button"
                                    @click=${() => this.frame.src = `${this.frame.src}`} 
                            />
                            <input 
                                    type="text"
                                    :bind=${this.frameURL} 
                                    @keydown=${(e: KeyboardEvent) => e.key === 'Enter' ? this.frame.src = this.frameURL.value : null}
                            >
                            <i
                                    class=${{
                                        "ti": true, 
                                        "ti-arrows-minimize": this.fullscreen, 
                                        "ti-arrows-maximize": computed(() => !this.fullscreen.value, [this.fullscreen]), 
                                        "icon-button": true
                                    }}
                                    @click=${() => this.fullscreen.value = !this.fullscreen.value}
                            />
                        </div>
                        <${this.frame} />
                    </div>
                </div>
                <div class="editor-terminal-area">
                    <${LoadingIndicator} name="Container" :if=${this.terminalLoading} />
                    <div :if=${this.containerError}>
                        Web-Containers do not work here. See a tutorial on how to enable them <a href="https://webcontainers.io/guides/browser-config">https://webcontainers.io/guides/browser-config</a>
                    </div>
                    ${termDiv}
                </div>
            </div>
        `
    }

    styles(): string {
        // language=SCSS
        return scss`
          .editor {
            display: grid;
            grid-template-rows: 44px auto 25%;
            height: 100%;
            background: #00000022;
            
            .top-bar {
              input {
                font-family: "Plus Jakarta Sans";
                font-size: 15px;
                height: 100%;
                background: transparent;
                color: #FFFFFF;
                padding: 10px;
                border: none;
                text-align: center;
                width: 100%;
              }
            }

            .editor-terminal-area {
              padding: 10px;
              width: 100%;
              overflow: hidden;
              position: relative;

              .terminal {
                border-radius: 10px;
                overflow: hidden;
                height: 100%;
                overflow: hidden;
              }
            }

            .editor-vertical {
              display: grid;
              grid-template-columns: auto 25%;
              grid-gap: 10px;
              padding: 0 10px 10px;

              .editor-code-editor-area {
                color: #FFF;
                height: 100%;
                border-radius: 10px;
                overflow: hidden;
                position: relative;

                .editor-code-files {
                  border-bottom: 2px solid #FFFFFF22;
                  background: #00000022;
                  overflow-y: auto;
                  position: relative;
                  white-space: pre;

                  ::-webkit-scrollbar {
                    height: 0;
                  }

                  button {
                    color: #FFF;
                    border: none;
                    background: transparent;
                    vertical-align: middle;
                  }

                  .files-tab {
                    padding: 10px;
                    cursor: pointer;

                    .file-icon {
                      font-size: 18px;
                      margin-right: 8px;
                    }

                    input {
                      background: transparent;
                      border: none;
                      width: 130px;
                      font-size: 13px;
                      color: #FFF;
                    }

                    i {
                      vertical-align: middle;
                      font-size: 16px;
                    }

                    &.selected {
                      background: #FFFFFF44;
                    }
                  }

                  .add-btn {
                    border: none;
                    cursor: pointer;
                    border-radius: 6px;
                    height: 28px;
                    color: #FFFFFFAA;
                    padding: 0;
                    width: 28px;
                    font-size: 17px;
                    margin-left: 5px;
                    margin-right: 100px;

                    &:hover {
                      color: #FFFFFF;
                      background: #FFFFFF11;
                    }
                  }
                }

                .run-btn {
                  color: #FFF;
                  border: none;
                  z-index: 1;
                  cursor: pointer;
                  position: absolute;
                  right: 5px;
                  top: 5px;
                  background: #5cba37;
                  border-radius: 6px;
                  height: 28px;
                  padding: 0;
                  width: 28px;
                  font-size: 17px;
                }

                editor-editor-part {
                  height: 100%;
                  overflow: hidden;
                }
              }

              .editor-preview {
                background: #FFFFFF;
                border-radius: 10px;
                overflow: hidden;
                position: relative;

                display: grid;
                grid-template-rows: 40px auto;

                .editor-preview-toolbar {
                  height: 40px;
                  background: #181a24;
                  display: grid;
                  border-bottom: 2px solid #FFFFFF44;
                  grid-template-columns: fit-content(10px) auto fit-content(10px);
                  align-items: center;
                  grid-gap: 10px;
                  padding: 0 5px;

                  .icon-button {
                    vertical-align: middle;
                    font-size: 19px;
                    width: 100%;
                  }

                  input {
                    background: #212531;
                    padding: 4px;
                    font-size: 14px;
                    border-radius: 4px;
                    border: none;
                    color: #FFFFFF;;
                  }
                }

                iframe {
                  width: 100%;
                  height: 100%;
                  border: none;
                }

                &.fullscreen {
                  position: fixed;
                  width: calc(100% - 20px);
                  height: calc(100% - 55px);
                  z-index: 10;
                }
              }
            }
          }
        `;
    }
}