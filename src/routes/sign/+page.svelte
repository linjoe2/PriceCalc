<script lang="ts">
  import { onMount } from 'svelte';
  let mounted = false;
  import { EmbedDirectTemplate } from '@documenso/embed-svelte';

  const token = '194'; // Replace with the actual token

  onMount(() => {
    mounted = true;
  });
</script>

<!-- {#if mounted}
  <EmbedDirectTemplate {token} />
{/if} -->