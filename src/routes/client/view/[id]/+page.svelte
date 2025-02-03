<script>
    import { onMount } from 'svelte';
    import ClientDialog from '../../ClientDialog.svelte';
    let clientId ='';
    import { page } from '$app/stores';
</script>

<ClientDialog clientId={$page.params.id} />