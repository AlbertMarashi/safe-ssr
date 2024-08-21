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

Inside of your `src/hooks.server.ts` file, call the `safe_request_wrapper` middleware function in your handle

```ts
import { safe_request_wrapper } from "safe-ssr/safe_request_wrapper"
import { sequence } from "@sveltejs/kit/hooks"

export const handle = sequence(
    // ... handler logic here will **not** have access to the current unique request symbol
    safe_request_wrapper,
    // ... handler logic here will have access to the current unique request symbol
)
```

This will wrap each incoming request in an [`AsyncLocalStorage`](https://nodejs.org/api/async_context.html#class-asynclocalstorage) context, with a unique [`Symbol`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol) assigned to it.

This symbol is then **later used** to retrive state uniquely associated with the current request - which is guaranteed to be isolated from other requests.


## 3. Passing state from the server to the client

Because state from `.ts` / `.js` modules are not returned to the browser, we need to manually pass them from the server to the client. This is done by using the `SerialiseClientState` component.

```svelte
<script lang="ts">
import SerialiseClientState from "safe-ssr/SerialiseClientState.svelte";

let {
    children
} = $props()
</script>
<SerialiseClientState/>
{@render children()}
```

## 4. Defining global state

You have two options for defining global state;

#### `$lib/[your_state_file].ts`
```ts
// returns a reactive object, isolated from other requests
import { isolated_state } from "safe-ssr";

export const app_state = isolated_state("app_state", {
    counter: 0,
})
```


#### `$lib/[your_state_file].svelte.ts`
```ts
// returns a non-reactive object, isolated from other requests
import { isolated_object } from "safe-ssr";

export const app_state = $state(isolated_object("app_state", {
    counter: 0,
}))
```

#### Return type
```ts
/**
 * both isolated_state and isolated_object return the same type, which looks like this:
 * Where {T} is the type of the initial value */
type ReturnType<T> = { inner: T }
```

## Retrieving state

Simply import the module into anywhere in your app.

`+page.ts`
```ts
import { app_state } from "$lib/app_state";

export function load() {
    app_state.inner.counter++;
}
```

`+page.svelte`
```svelte
<script lang="ts">
import { app_state } from "$lib/app_state";
</script>
<!-- this will never be higher than 1 -->
{ app_state.inner.counter }
```

## Advanced usage