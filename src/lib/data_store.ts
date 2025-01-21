import request_symbol from "./request_symbol.js"

export class RequestDataStore<T> {
    // We use a WeakMap, so that the request data is
    // garbage collected after the request is complete.
    stores: WeakMap<symbol, T> = new WeakMap()

    get data() {
        const sym = request_symbol.current()
        const request_data = this.stores.get(sym)
        if(!request_data) throw new Error("No request data found for symbol")
        return request_data
    }

    set data(data: T) {
        const sym = request_symbol.current()

        this.stores.set(sym, data)
    }
}
