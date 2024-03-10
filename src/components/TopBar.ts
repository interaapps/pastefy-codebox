import { css, html, JDOMComponent } from 'jdomjs'

import { CustomElement } from 'jdomjs/src/decorators.ts'
import { router } from "../main.ts";
import UserProfile from "./UserProfile.ts";
import Logo from "./Logo.ts";


@CustomElement("pastefy-top-bar")
export default class TopBar extends JDOMComponent.unshadowed {
    render() {
        return html`
            <div class="top-bar" style="margin-bottom: 10px">
                <${Logo} />

                <div>
                    <slot name="middle" />
                </div>

                <div class="top-bar-buttons">
                    <slot name="buttons" />
                    <${UserProfile} />
                </div>
            </div>
        `
    }
}