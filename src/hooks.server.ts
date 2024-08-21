import { safe_request_wrapper } from "$lib/safe_request_wrapper.js";
import { sequence } from "@sveltejs/kit/hooks";
import { app_state } from "./routes/app.svelte.js";


export const handle = sequence(
    safe_request_wrapper,
    async ({ event, resolve }) => {
        app_state.inner.counter++

        return await resolve(event)
    }
)