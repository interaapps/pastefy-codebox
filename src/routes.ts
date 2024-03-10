import { html } from "jdomjs";

import HomeView from "./views/HomeView";
import EditorView from "./views/editor/EditorView.ts";

export default [
  {
    path: "/",
    name: "home",
    view: () => new HomeView(),
  },
  {
    path: "/:paste",
    name: "editor",
    view: () => html`<${EditorView} test.attr="YOo" />`,
  },
];
