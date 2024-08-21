import { safe_state } from "$lib/state.svelte.js"

export const app_state = safe_state("app_state", {
    counter: 0,
})
