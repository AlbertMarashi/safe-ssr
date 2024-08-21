<script lang="ts">
import SerialiseClientState from "$lib/SerialiseClientState.svelte"

let {
    children
} = $props()
</script>
{@render children()}
<SerialiseClientState/>