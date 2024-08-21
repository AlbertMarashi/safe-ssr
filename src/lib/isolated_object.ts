import { browser } from "$app/environment"
import { uneval } from "devalue"
import request_symbol from "./request_symbol.js"

const request_stores: WeakMap<symbol, Map<string, unknown>> = new WeakMap()

export function serialise_state(): string {
    const map = get_or_init()
    const entries = Array.from(map).map(([key, value]) => [uneval(key), uneval(value)])

    return `<script>
window.__SAFE_SSR_STATE__ = new Map();
${entries.map(([key, value]) => `window.__SAFE_SSR_STATE__.set(${key}, ${value})`).join(";")}
</script>`
}

function get_or_init() {
    const sym = request_symbol.current()
    return request_stores.get(sym) ?? request_stores.set(sym, new Map()).get(sym)!
}

/**
 * @param key -The key to associate the unique store with. This is required during client-side in order to
 * figure out which store to retrieve from the window.__SAFE_SSR_STATE__ map. It must be unique
 * @param initial - the initial value.
 *
 * Behaviour:
 * - On the server, the initial value is cloned with [`structuredClone`](https://developer.mozilla.org/en-US/docs/Web/API/structuredClone) for every
 * request, and stored in a WeakMap (which is garbage collected after the request is complete).
 * - On the client, we will first look to see if the server has already stored the state in the window.__SAFE_SSR_STATE__ map.
 *   If it has, we will return the value from that map. Otherwise, we will return the initial value.
 */
export function isolated_object<T>(key: string, initial: T): { inner: T } {
    if (browser) return { get inner() { return get_client_state(key, initial) as T } }

    return {
        get inner() {
            const map = get_or_init()

            return (map.get(key) ?? map.set(key, structuredClone(initial)).get(key)!) as T
        }
    }
}


declare global {
    interface Window {
        __SAFE_SSR_STATE__?: Map<string, unknown>
    }
}

function get_client_state<T>(key: string, initial: T) {
    const state = window.__SAFE_SSR_STATE__?.get(key)
    if (state) return state as T

    return initial
}