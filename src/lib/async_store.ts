import { AsyncLocalStorage } from "node:async_hooks"
import request_symbol from "./request_symbol.js"

/// Create a new AsyncLocalStorage for to isolate requests
export const async_local_storage = new AsyncLocalStorage<symbol>()

export async function safe_wrapper<T>(cb: () => T): Promise<T> {
    return async_local_storage.run(Symbol(), () => cb())
}

/// override the request symbol on the server-side (client-side will remain)
request_symbol.current = () => {
    const symbol = async_local_storage.getStore()
    if (symbol === undefined) {
        throw new Error("Request symbol has not been initialized")
    }
    return symbol
}