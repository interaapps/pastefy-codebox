import {html, JDOMComponent, state} from 'jdomjs'

import {CustomElement, State} from 'jdomjs/src/decorators.ts'
import {scss} from "../scss.ts";


@CustomElement("pastefy-loading-indicator")
export default class LoadingIndicator extends JDOMComponent.unshadowed {

    @State()
    name = state('Project')

    render() {
        return html`
            <div id="loading-indicator">
                <div>
                    <i class="ti ti-box" />
                    <h2>Loading ${this.name}</h2>
                    <div id="progress"></div>
                </div>
            </div>
        `
    }

    styles(): string {

        /*@language css*/
        return scss`
            #loading-indicator {
                position: absolute;
                width: 100%;
                height: 100%;
                top: 0;
                left: 0;
                z-index: 100;
                background: #13151baa;
                backdrop-filter: blur(5px);
                border-radius: 10px;

                & > div {
                    position: absolute;
                    left: 50%;
                    top: 50%;
                    transform: translate(-50%, -50%);
                    text-align: center;

                    i {
                        font-size: 56px;
                    }

                    h2 {
                        margin-top: 30px;
                    }

                    #progress {
                        height: 11px;
                        width: 96px;
                        background: url(/loading.svg) repeat;
                        background-size: cover;
                        background-position-x: 69px;
                        margin: 20px auto auto;
                        animation: progress-loading 2.5s infinite linear;

                        @keyframes progress-loading {
                            from {
                                background-position-x: 0;
                            }
                            to {
                                background-position-x: 96px;
                            }
                        }
                    }
                }
            }
        `;
    }
}