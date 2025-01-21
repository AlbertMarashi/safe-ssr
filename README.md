# safe-ssr

> [!NOTE]
>
> Safe **server-side isolated state** for **SvelteKit** & **Svelte 5**

## What is it?
SvelteKit leaks state between requests, which can be a security issue. This package provides a way to safely isolate data between requests in a SvelteKit app.

See this issue for more details:
- https://github.com/sveltejs/kit/discussions/4339


## 1. Install
```bash
npm i safe-ssr
```

## 2. Wrapping your requests

Inside of your `src/hooks.server.ts` file, call the `safe_request_wrapper` middleware function available in `safe-ssr/safe_request_wrapper` in your handle

```ts
import { safe_request_wrapper } from "safe-ssr/safe_request_wrapper"
import { request_symbol } from "safe-ssr"
import { sequence } from "@sveltejs/kit/hooks"

export const handle = sequence(
    // ... handler logic BEFORE here will **not** have access to the current unique request symbol
    safe_request_wrapper,
    // ... handler logic BEYOND here will have access to the current unique request symbol
    ({ event, resolve }) => {
        console.log(request_symbol.current()) // -> Symbol()
        return resolve(event)
    }
)
```

This will wrap each incoming request in an [`AsyncLocalStorage`](https://nodejs.org/api/async_context.html#class-asynclocalstorage) context, with a unique [`Symbol`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol) assigned to it.

This symbol is then **later used** to retrive state uniquely associated with the current request - which is guaranteed to be isolated from other requests.


## 3. Passing state from the server to the client

Because state from `.ts` / `.js` modules are not returned to the browser, we need to manually pass them from the server to the client. This is done by using the `SerialiseClientState` component within your root `+layout.svelte` file.

> [!WARNING]
> This will serialise all of the state to the client when returning the SSR response. Make sure to put it at the very end of your root `+layout.svelte` file so that it is serialised last, ensuring that all your state is serialized to the client.

```svelte
<script lang="ts">
import { SerialiseClientState } from "safe-ssr";

let {
    children
} = $props()
</script>
{@render children()}
<!-- Make sure to put this at the very end of your root `+layout.svelte` file -->
<SerialiseClientState/>
```

## 4. Defining global state

#### `src/lib/[your_state_file].ts`
```ts
// returns a reactive object, isolated from other requests
import { safe_state } from "safe-ssr";

export const app_state = safe_state("app_state", {
    counter: 0,
})
```

#### Return type
```ts
/**
 * both safe_state and safe_state return the same type, which looks like this:
 * Where {T} is the type of the initial value
 *
 * We use the `inner` property to access the value
 * Internally, `inner` is a `get` method that returns the state uniquely associated
 * with the current request.
 **/
type ReturnType<T> = { inner: T }
```

## Retrieving state

Simply import the module into anywhere in your app.

`+page.server.ts`
```ts
import { app_state } from "$lib/[your_state_file]";

export function load() {
    app_state.inner.counter++;
}
```

`+page.svelte`
```svelte
<script lang="ts">
import { app_state } from "$lib/[your_state_file]";
</script>
<!-- this will never be higher than 1, because requests are isolated -->
<div>Counter: { app_state.inner.counter }</div>

<button onclick={() => app_state.inner.counter++}>+</button>
```

## Advanced usage examples

> [!TIP]
>
> Maybe you wanna create a server-side database instance that is authenticated to individual users but isolated from other requests?
>
> Unfortunately, by default, SvelteKit **load functions waterfall**, which means if you have complex nested routes and `load` functions, you lose out on performance because all of your load functions depend on `await parent()` calls in SvelteKit to get access to the database defined in the root `+layout.svelte` file.
>
> Fortunately, using the `safe_request_wrapper` middleware, you can isolate and authenticate your database instance to individual requests, whilst making it globally accessible across your app
>
> This means you can turn sequential waterfalled requests into parallellised requests, which lead to a big performance boost!

You can use the `request_symbol` store to customise and implement your own behaviour. The `request_symbol` import has a `current()` method that returns the current request symbol or throws an error if one has not been set.

## Per-request database isolation example

`hooks.server.ts`
```ts
import { safe_request_wrapper } from "safe-ssr/safe_request_wrapper"
import { RequestDataStore } from "safe-ssr"
import { sequence } from "@sveltejs/kit/hooks"
import { auth_state } from "$lib/auth-state"
import { req_dbs } from "$lib/db"
import { Database } from "YOUR-DATABASE-LIBRARY"

export const handle = sequence(
    safe_request_wrapper,
    read_auth_token_cookie,
    setup_isolated_db,
)

async function read_auth_token_cookie({ event, resolve }) {
    auth_state.inner.token = event.cookies.get("token")

    return resolve(event)
}

async function setup_isolated_db({ event, resolve }) {
    let db: Promise<Database> | undefined
    
    // Associate the current request symbol with a function
    // that returns a Promise<Database>, and can only be retrieved
    // within a scoped isolated request (after the safe_request_wrapper middleware has been run)
    req_data.data = {
        // create a lazy-loaded database instance,
        // because not every request will need one.
        // (e.g. not trigger the database connection for simple asset requests (css, js, etc))
        get db(): db ?? db = Database.connect(auth_state.inner.token)
    }

    return await resolve(event)
}
```

`src/lib/db.ts`
```ts
import { request_symbol } from "safe-ssr"

// Internally, we use a WeakMap<symbol, Promise<Database>> to store the database instances
// so that they are garbage collected after the request with that symbol is completed.
// This allows us to create a lazy-loaded database instance, uniquely associated with
// the current request / authenticated user.
const db_store = new RequestDataStore<{
    db: Promise<Database>
}>()

export function get_db(): Promise<Database> {
    return db_store.data.db
}
```

`src/lib/auth-state.ts`
```ts
import { safe_state } from "safe-ssr"

export const auth_state = safe_state("auth_state", {
    token: null
})

```

`+page.server.ts`
```ts
import { auth_state } from "$lib/auth-state"
import { get_db } from "$lib/db"

export async function load() {
    // get the database authenticated to the current
    // requests user, which is isolated from other requests.
    const db = await get_db()

    // do something with the database
    const my_posts = await db.query("SELECT * FROM posts")

    return {
        my_posts
    }
}
```