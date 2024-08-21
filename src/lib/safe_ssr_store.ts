
/**
 * A store that returns the current ongoing request's symbol via the `.request_symbol()` method.
 */
export default {
    /**
     * Returns the current async context's request symbol.
     *
     * This is safe to call only after the hooks.server.ts safe_request_wrapper has been initialized.
     */
    request_symbol(): symbol | undefined {
        throw new Error("AsyncLocalStorage has not been initialized")
    }
}