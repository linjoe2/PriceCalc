<script>
    import { onMount } from 'svelte';
    import ClientDialog from '../../ClientDialog.svelte';
    let clientId ='';
    import { page } from '$app/stores';

    onMount(async () => {
        clientId = $page.params.id;
    });

</script>

<ClientDialog selectedClient={clientId} isOpen={true} />