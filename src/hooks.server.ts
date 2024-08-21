import { safe_request_wrapper } from "$lib/safe_request_wrapper.js"
import { sequence } from "@sveltejs/kit/hooks"
import { app_state } from "./routes/app.js"
import request_symbol from "$lib/request_symbol.js"

export const handle = sequence(
    safe_request_wrapper,
    ({ event, resolve }) => {
        console.log(request_symbol.current())
        return resolve(event)
    }
)