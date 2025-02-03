<script>
    import Plus from "lucide-svelte/icons/plus";
    import Pencil from "lucide-svelte/icons/pencil";
    import Trash from "lucide-svelte/icons/trash";
    import Eye from "lucide-svelte/icons/eye";
    import { onMount } from 'svelte';
    import { client } from '$lib/appwrite';
    import { selectedUser } from '../../stores/userStore';
    import { Databases, Query } from 'appwrite';
    import { goto } from '$app/navigation';
    let clientData = [];
    export let clientId;
     // Fetch client data from Appwrite
      onMount(async () => {
       try {
            const databases = new Databases(client);
            const response = await databases.getDocument(
                'PriceCalc', // databaseId
                '67362abc0039525e36b6', // collectionId
                clientId // documentId
            );
            clientData = response;
            console.log('id', clientId);
            console.log('response', clientData);
        } catch (error) {
            console.error('Error fetching client data:', error);
        }
    });

    function startNewProject() {
        $selectedUser = clientData;
        goto('/project/edit/new');
        
    }
</script>

<div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">{clientData.name} {clientData.lastname}</h1>
    
    <div class="bg-white rounded-lg shadow-md p-6">
        <p>Bedrijf: {clientData.businessname}</p>
        <p>Address: {clientData.adress} {clientData.huisnummer}, {clientData.postcode}, {clientData.woonplaats}</p>
        
        <div class="mt-6">
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
                    {#each clientData.projects as project}
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
                                <a href={`/project/edit/${project.$id}`} class="font-bold py-2 px-4 rounded">
                                    <Pencil class="inline mr-1" />
                                </a>
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>

        <div class="flex flex-col gap-4 mt-6">
            <a on:click={() => startNewProject()} class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-center">Start nieuw project</a>
            <a href="/agenda" class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded text-center">Agenda inplannen</a>
            <a href={`/client/edit/${clientData.$id}`} class="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded text-center">Klant bewerken</a>
        </div>
    </div>
</div>