import { JDOMComponent, html } from 'jdomjs'
import { CustomElement } from 'jdomjs/src/decorators.ts'
import Router from "jdomjs/src/router/Router.js";

@CustomElement("app-root")
export default class App extends JDOMComponent {
    router: Router

    constructor() {
        super({ shadowed: false });
    }

    render() {
        return html`
            <div style=${{height: '100%'}}>
                ${this.router.view}
            </div>
        `
    }
}