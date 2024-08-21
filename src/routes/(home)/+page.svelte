<script lang="ts">
import { app_state } from "../app.js"

const clicked = () => {
    app_state.inner.counter++
}

</script>

Counter: { app_state.inner.counter }

<button onclick={clicked}>+</button>

<a href="/foo">Foo</a>