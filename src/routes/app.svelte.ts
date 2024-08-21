import { isolated_state } from "$lib/state.svelte.js";

export const app_state = isolated_state("app_state", {
    counter: 0,
})