import { isolated_object } from "./isolated_object.js";



export function isolated_state<T>(key: string, initial: T): { inner: T } {
    let value = $state(isolated_object(key, initial))
    return value
}
