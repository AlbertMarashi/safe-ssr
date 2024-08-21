<script lang="ts">
import { browser } from "$app/environment";
import { get_current_stores } from "$lib/isolated_object.js";
import { uneval } from "devalue";

</script>
<svelte:head>
    {#if !browser}
        {@const script = [
            `<script>`,
            "window.__SAFE_SSR_STATE__ = new Map();",
            ...[...get_current_stores()].map(([key, value]) =>
                `__SAFE_SSR_STATE__.set(${uneval(key)}, ${uneval(value)});`
            ),
            `<\/script>`
        ]}
        {@html script.join("")}
    {/if}
</svelte:head>