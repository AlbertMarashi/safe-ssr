<script lang="ts">
import { app_state } from "./app.svelte.js";
</script>

Counter: { app_state.inner.counter }

<button onclick={() => app_state.inner.counter++}>+</button>