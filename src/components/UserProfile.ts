import {computed, css, html, JDOMComponent} from 'jdomjs'

import { CustomElement } from 'jdomjs/src/decorators.ts'
import { router } from "../main.ts";
import {login, user} from "../user.ts";
import {scss} from "../scss.ts";


@CustomElement("pastefy-code-user-profile")
export default class UserProfile extends JDOMComponent.unshadowed {
    render() {
        return html`
            ${computed(() => user.value
                    ? html`
                        <div class="profile">
                            <img crossorigin="anonymous" src=${user.value.profile_picture} alt="profile-picture" />
                        </div>
                    `
                    : html`<button class="btn" @click=${() => login()}>LOGIN</button>`,
            [user])}
        `
    }

    styles(): string {

        /*@language css*/
        return scss`
            .profile {
                display: inline-block;
                margin-left: 10px;
                img {
                    display: block;
                    height: 30px;
                    width: 30px;
                    border-radius: 40px;
                    object-fit: cover;
                }
            }
        `;
    }
}