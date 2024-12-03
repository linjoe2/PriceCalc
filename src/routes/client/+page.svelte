<script lang="ts">
    import { Databases } from "appwrite";
    import * as Card from "$lib/components/ui/card";
    import * as Dialog from '$lib/components/ui/dialog'
    import UserRoundPen from "lucide-svelte/icons/user-round-pen";
    import PencilRuler from "lucide-svelte/icons/pencil-ruler";
    import { client } from '$lib/appwrite';
    import { onMount } from "svelte";
    import { selectedUser } from '../../stores/userStore';

    const databases = new Databases(client);
    let clients = [];
    let selectedClient = null;
    let isDialogOpen = false;

    onMount(async () => {
        const result = await databases.listDocuments(
            'PriceCalc', // databaseId
            '67362abc0039525e36b6', // collectionId
            [] // queries (optional)
        );

        console.log(result);
        clients = result.documents;
    });

    function openDialog(client) {
        selectedClient = client;
        isDialogOpen = true;
        selectedUser.set(selectedClient); // Uncomment and modify as needed

    }

    function closeDialog() {
        isDialogOpen = false;
    }


</script>

<h1>Klanten</h1>
<div class="flex justify-end items-center">
    <a href="/client/new"><button class="mr-2">+ Nieuw</button></a>
    <UserRoundPen />
</div>

<ul class="list-disc pl-5">
    {#each clients as client}
        <li class="flex justify-between items-center">
            <span class="text-lg font-semibold" on:click={() => openDialog(client)}>{client.name} {client.lastname}</span>
            <a href={`https://maps.google.com/maps?q=${client.adress}+${client.huisnummer}+${client.postcode}+${client.woonplaats}`} target="_blank" rel="noopener noreferrer">
                {client.adress} {client.huisnummer} {client.postcode} {client.woonplaats}
            </a>
            <div class="flex space-x-2">
                <a href={`/client/edit/${client.$id}`} class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                    <PencilRuler />
                </a>
            </div>
        </li>
    {/each}
</ul>

{#if isDialogOpen}
<Dialog.Root open={isDialogOpen} onOpenChange={closeDialog}>
    <Dialog.Trigger style="display: none;">Open</Dialog.Trigger>
    <Dialog.Content>
      <Dialog.Header>
        <Dialog.Title>{selectedClient.name} {selectedClient.lastname}</Dialog.Title>
        <Dialog.Description>
        {#if selectedClient}
            <p>Bedrijf: {selectedClient.businessname}</p>
            <p>Address: {selectedClient.adress} {selectedClient.huisnummer}, {selectedClient.postcode}, {selectedClient.woonplaats}</p><br>
            {#each selectedClient.projects as project}
                <p>{project.datum}</p>
                <p>{JSON.parse(project.items).length} items</p>
                <p>Current fase: {project.fase}</p>
                <a href={`/project/edit/${project.$id}`} class="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Edit</a>
            {/each}
            <br>
            <a href="/project/edit/new" class="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Start nieuw project</a>
            <a href="/agenda" class="mt-4 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">Agenda inplannen</a>
            {/if}
        </Dialog.Description>
      </Dialog.Header>
    </Dialog.Content>
  </Dialog.Root>

{/if}