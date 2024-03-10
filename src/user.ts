import IAOauth from "./IAOauth.js";
import {state} from "jdomjs";
import { api } from "./main.ts";

const session = localStorage['box_session']

export const user = state(null)

user.addListener(u => {
    console.log('LOGGED_IN', u)
})

export async function initUser() {
    const userObj = await api.get('/user')
    if (userObj.logged_in) {
        user.value = userObj
    }
}

export async function login(){
    const url = new URL(window.location.toString())
    url.pathname = '/logged_in.html'

    new IAOauth('yio57t9r9tsgmmf')
        .addScope("user:read")
        .addScope("pastefy|pastes")
        .addScope("pastefy|folders")
        .addScope("pastefy|notifications")
        .setState(window.location.toString())
        .setRedirect(url.toString())
        .open()
}