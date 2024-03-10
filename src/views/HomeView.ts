import {computed, css, html, JDOMComponent, state} from 'jdomjs'
import { CustomElement } from 'jdomjs/src/decorators.ts'
import {api, router} from "../main";
import Logo from "../components/Logo.ts";
import {ForEach} from "jdomjs/src/template/helper/components.js";
import configs from "./editor/configs";
import {user} from "../user.ts";
import UserProfile from "../components/UserProfile.ts";
import TopBar from "../components/TopBar.ts";
import {scss} from "../scss.ts";

@CustomElement("home-view")
export default class HomeView extends JDOMComponent.unshadowed {
    latestPastes = state<any>([])


    transformPasteRequest(pastes) {
        pastes.forEach(p => {
            p.tags.forEach(t => {
                if (t.startsWith('codebox-type-')) {
                    p.config = configs[t.replace('codebox-type-', '')]
                }
            })
        })
    }

    loadUserPastes() {
        api.get('/user/pastes?filter_tags=codebox&shorten_content=true')
            .then(pastes => {
                if (Array.isArray(pastes)) {
                    this.transformPasteRequest(pastes)
                    this.latestPastes.value = pastes
                }
            })
    }

    render() {
        document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#212531')

        if (user.value) {
            this.loadUserPastes()
        }

        user.addListener(() => {
            this.loadUserPastes()
        })

        const publicPastes = state<any>([])
        api.get('/public-pastes?filter_tags=codebox&shorten_content=true')
            .then(pastes => {
                this.transformPasteRequest(pastes)
                publicPastes.value = pastes
            })


        return html`
            <${TopBar} />
            <div class="home-page">
                <h2 :if=${computed(() => this.latestPastes.value.length, [this.latestPastes])}>Latest Projects</h2>
                <div class="projects">
                    <${ForEach}
                        value=${this.latestPastes}
                        content=${(paste) => html`
                            <a class="project" @click=${() => router.go(`/${paste.id}`)}>
                                <i class=${`ti ti-${paste.config?.icon || 'box'}`} />
                                <span>${paste.title}</span>
                            </a>
                        `}
                    />
                </div>
                        
                <h2>New Project</h2>
                <div class="projects">
                <${ForEach}
                    value=${Object.entries(configs)}
                    content=${([name, config]) => html`
                        <a class="project" @click=${() => router.go(`/new?type=${name}`)}>
                            <i class=${`ti ti-${config.icon}`} />
                            <span>${config.name}</span>
                        </a>
                    `}
                />
                </div>



                <h2 :if=${computed(() => publicPastes.value.length, [publicPastes])}>Latest Public Projects</h2>
                <div class="projects">
                    <${ForEach}
                            value=${publicPastes}
                            content=${(paste) => html`
                            <a class="project" @click=${() => router.go(`/${paste.id}`)}>
                                <i class=${`ti ti-${paste.config?.icon || 'box'}`} />
                                <span>${paste.title}</span>
                            </a>
                        `}
                    />
                </div>
        `
    }

    styles(): string {
        // language=SCSS
        return scss`
            .home-page {
                padding: 7px 10px;
                h2 {
                    margin-bottom: 10px;
                    margin-top: 30px;
                }
                .projects {
                    .project {
                        border: 2px solid #FFFFFF33;
                        border-radius: 8px;
                        display: inline-block;
                        text-align: center;
                        padding: 14px;
                        cursor: pointer;
                        width: 200px;

                        margin-right: 10px;
                        margin-bottom: 10px;

                        i {
                            font-size: 44px;
                            display: block;
                        }

                        span {
                            display: block;
                            margin-top: 10px;
                            font-size: 18px;
                            font-family: "Plus Jakarta Sans";
                        }

                        &:hover {
                            background: #FFFFFF11;
                        }
                    }
                }
            }
        `;
    }
}