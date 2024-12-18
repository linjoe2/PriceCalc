<script>
    import { createEventDispatcher } from 'svelte';
    import { onMount } from 'svelte';
    import * as Dialog from '$lib/components/ui/dialog';
    import Plus from "lucide-svelte/icons/plus";
    import Pencil from "lucide-svelte/icons/pencil";
    import Trash from "lucide-svelte/icons/trash";
    import Eye from "lucide-svelte/icons/eye";
 
 
  export let selectedClient;
    export let isOpen; // New prop to control dialog visibility
    const dispatch = createEventDispatcher();

    function closeDialog() {
        dispatch('close'); // Dispatch close event to parent
    }

    // Optional: You can use onMount to handle any side effects when the dialog opens
    onMount(() => {
        // Any additional logic when the dialog opens
    });
</script>

<Dialog.Root open={isOpen} onOpenChange={closeDialog}>
    <Dialog.Trigger style="display: none;">Open</Dialog.Trigger>
    <Dialog.Content>
        <Dialog.Header>
            <Dialog.Title>{selectedClient.name} {selectedClient.lastname}</Dialog.Title>
            <Dialog.Description>
                {#if selectedClient}
                    <p>Bedrijf: {selectedClient.businessname}</p>
                    <p>Address: {selectedClient.adress} {selectedClient.huisnummer}, {selectedClient.postcode}, {selectedClient.woonplaats}</p><br>
                    <table class="min-w-full">
                        <thead>
                            <tr>
                                <th class="px-4 py-2">Laatste update</th>
                                <th class="px-4 py-2">Aantal items</th>
                                <th class="px-4 py-2">Status</th>
                                <th class="px-4 py-2">Acties</th>
                            </tr>
                        </thead>
                        <tbody>
                            {#each selectedClient.projects as project}
                                <tr class="border-b">
                                    <td class="px-4 py-2 cursor-pointer" on:click={() => window.location.href = `/project/view/${project.$id}`}>
                                        {new Date(project.updatedAt).toLocaleDateString('nl-NL')}
                                    </td>
                                    <td class="px-4 py-2 cursor-pointer" on:click={() => window.location.href = `/project/view/${project.$id}`}>
                                        {JSON.parse(project.items).length} items
                                    </td>
                                    <td class="px-4 py-2 cursor-pointer" on:click={() => window.location.href = `/project/view/${project.$id}`}>
                                        {project.fase}
                                    </td>
                                    <td class="px-4 py-2">
                                        <a href={`/project/edit/${project.$id}`} class=" font-bold py-2 px-4 rounded">
                                            <Pencil class="inline mr-1" />
                                        </a>
                                    </td>
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                    <br>
                    <a href="/project/edit/new" class="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Start nieuw project</a>
                    <a href="/agenda" class="mt-4 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">Agenda inplannen</a>
                    <a href={`/client/edit/${selectedClient.$id}`} class="mt-4 bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded">Klant bewerken</a>
                {/if}
            </Dialog.Description>
        </Dialog.Header>
    </Dialog.Content>
</Dialog.Root>