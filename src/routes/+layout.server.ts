import { app_state } from "./app.js"

export async function load() {
    app_state.inner.counter += 1
}