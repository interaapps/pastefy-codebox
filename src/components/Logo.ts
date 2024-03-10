import { css, html, JDOMComponent } from 'jdomjs'

import { CustomElement } from 'jdomjs/src/decorators.ts'
import { router } from "../main.ts";


@CustomElement("pastefy-code-box-logo")
export default class Logo extends JDOMComponent.unshadowed {
    render() {
        return html`
            <div @click=${ () => router.go('/') } class="pastefy-box-logo">
                <i class="ti ti-box-seam" />
                <span>Pastefy <b>CodeBox</b></span>
            </div>
        `
    }

    styles(): string {

        /*@language css*/
        return css`
            .pastefy-box-logo {
                height: 100%;
                width: fit-content;
                cursor: pointer;
                display: grid;
                grid-auto-flow: column;
                align-items: center;
                margin-left: -5px;
                border-radius: 7px;
                padding: 0 5px;
                
                i {
                    margin-right: 10px;
                    font-size: 30px;
                    display: inline-block;
                }
                span {
                    display: inline-block;
                    font-size: 19px;
                    &, b {
                        font-family: 'Plus Jakarta Sans', 'DM Mono';
                    }
                    b {
                        font-weight: 600;
                    }
                }
                &:hover {
                    background: #FFFFFF11;
                }
            }
        `;
    }
}