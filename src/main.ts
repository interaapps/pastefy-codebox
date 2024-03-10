import App from "./App";
import { $, html } from "jdomjs";

import Router from "jdomjs/src/router/Router.js";
import routes from "./routes";
import { Cajax } from 'cajaxjs'
import { initUser } from './user.ts'

export const router = new Router(routes);

export const api = new Cajax('https://pastefy.app/api/v2')
console.log(api)
const session = localStorage['box_session']

if (session) {
    api.bearer(session)
}

api.promiseInterceptor = r => r.json()
initUser()

html`<${App} router=${router} />`
    .appendTo(document);

router.init();
