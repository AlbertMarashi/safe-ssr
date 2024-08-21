import { safe_request_wrapper } from "$lib/safe_request_wrapper.js"
import { sequence } from "@sveltejs/kit/hooks"

export const handle = sequence(
    safe_request_wrapper,
)