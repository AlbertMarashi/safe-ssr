import { app_state } from "../app.svelte.js"

export async function load() {
    app_state.inner.counter += 1

    return {
        title: "Foo"
    }
}