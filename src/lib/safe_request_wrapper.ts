import type { MaybePromise, RequestEvent, ResolveOptions } from "@sveltejs/kit"
import { AsyncLocalStorage } from "node:async_hooks"
import request_symbol from "./request_symbol.js"

/// Create a new AsyncLocalStorage for to isolate requests
const async_local_storage = new AsyncLocalStorage<symbol>()

/// override the request symbol on the server-side (client-side will remain)
request_symbol.current = () => {
    const symbol = async_local_storage.getStore()
    if (symbol === undefined) {
        throw new Error("Request symbol has not been initialized")
    }
    return symbol
}

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
    return async_local_storage.run(Symbol(), () => resolve(event))
}