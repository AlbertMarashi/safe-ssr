import type { MaybePromise, RequestEvent, ResolveOptions } from "@sveltejs/kit"
import { safe_wrapper } from "./async_store.js"

/**
 * Wraps the hooks.server.ts `handle` function to with a middleware that
 * creates a new AsyncLocalStorage store for each request.
 *
 * This allows us to access the current request symbol via the `safe_ssr_store.request_symbol()` method.
 * which can be later used to store isolated data for each request in
 * a WeakMap (which is garbage collected after the request is complete).
 *
 * @example
 * import { safe_request_wrapper } from "safe-ssr/safe_request_wrapper";
 * import { sequence } from '@sveltejs/kit/hooks';
 *
 * export const handle = sequence(
 *     // ... other hooks
 *     safe_request_wrapper,
 *     // ... other hooks (after this point, the request symbol is available)
 * );
 */
export async function safe_request_wrapper({
    event,
    resolve
}: {
    event: RequestEvent;
    resolve(event: RequestEvent, opts?: ResolveOptions): MaybePromise<Response>;
}): Promise<Response> {
    return safe_wrapper(() => resolve(event))
}

