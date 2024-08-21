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
 * request, and stored in a WeakMap (which is garbage collected after the request is complete, as long as
 * the request symbol is no longer in scope).
 * - On the client, we will first look to see if the server has already stored the state in the `window.__SAFE_SSR_STATE__` state
 * that we have serialized with the `SerialiseClientState` component, otherwise we will return the initial value.
 */
export function safe_state<T>(key: string, initial: T): { inner: T } {
    if (browser) {
        // since only the client-side has reactivity, we use the $state rune
        // to get the reactive state
        const state = $state(get_client_state(key, initial))
        return { get inner() { return state } }
    }


    return {
        get inner() {
            // no reactivity needed in SSR
            const map = get_or_init()
            // get the state from the map, or clone the initial value if it doesn't exist
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