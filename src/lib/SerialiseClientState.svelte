<!--
@component
This component is used to serialise the client state of the current page.

It is used to ensure that the client state is serialised and sent to the server.

Put it at the very end of your root `+layout.svelte` file.
-->
<script lang="ts">
import { browser } from "$app/environment"
import { serialise_state } from "./isolated_object.js"

</script>
{#if !browser}
    <!-- eslint-disable-next-line svelte/no-at-html-tags -->
    {@html serialise_state()}
{/if}

