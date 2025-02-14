<script lang="ts">
    import Plus from "lucide-svelte/icons/plus";
    import Pencil from "lucide-svelte/icons/pencil";
    import Trash from "lucide-svelte/icons/trash";
    import Eye from "lucide-svelte/icons/eye";
    import { onMount } from 'svelte';
    import { client } from '$lib/appwrite';
    import { selectedUser } from '../../stores/userStore';
    import { Databases, Query } from 'appwrite';
    import { goto } from '$app/navigation';
    import type { Client } from "$lib/types";
    let clientData: Client = {
        name: '',
        lastname: '',
        businessname: '',
        adress: '',
        huisnummer: '',
        postcode: '',
        woonplaats: '',
        email: '',
        telefoonnummer: ''
    };
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
            clientData = response as unknown as Client;
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

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="flex justify-between">
        <h1 class="text-3xl font-bold mb-6 text-gray-900">{clientData.name} {clientData.lastname}</h1>
        <h1 class="text-3xl font-bold mb-6 text-gray-300">{clientData.subcontractors?.businessname}</h1>
    </div>
    <div class="bg-white rounded-lg shadow-lg p-6 md:p-8">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div class="p-4 bg-gray-50 rounded-lg">
                <h2 class="font-semibold text-gray-700 mb-2">Persoonlijke gegevens</h2>
                <p class="text-gray-600">{clientData.businessname}</p>
                <p class="text-gray-600">{clientData.email}</p>
                <p class="text-gray-600">{clientData.telefoonnummer}</p>
            </div>
            <div class="p-4 bg-gray-50 rounded-lg">
                <h2 class="font-semibold text-gray-700 mb-2">Adresgegevens</h2>
                <p class="text-gray-600">{clientData.adress} {clientData.huisnummer}</p>
                <p class="text-gray-600">{clientData.postcode}, {clientData.woonplaats}</p>
            </div>
        </div>
        
        <div class="overflow-x-auto">
            <table class="w-full">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Laatste update</th>
                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aantal items</th>
                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acties</th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    {#each clientData?.projects ?? [] as project}
                        <tr class="hover:bg-gray-50 transition-colors">
                            <td class="px-4 py-4 whitespace-nowrap cursor-pointer" on:click={() => window.location.href = `/project/view/${project.$id}`}>
                                {project.$updatedAt ? new Date(project.$updatedAt).toLocaleDateString('nl-NL') : '-'}
                            </td>
                            <td class="px-4 py-4 whitespace-nowrap cursor-pointer" on:click={() => window.location.href = `/project/view/${project.$id}`}>
                                {JSON.parse(project.items).length} items
                            </td>
                            <td class="px-4 py-4 whitespace-nowrap cursor-pointer" on:click={() => window.location.href = `/project/view/${project.$id}`}>
                                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                    {project.fase}
                                </span>
                            </td>
                            <td class="px-4 py-4 whitespace-nowrap">
                                <a href={`/project/edit/${project.$id}`} class="text-gray-600 hover:text-gray-900 transition-colors">
                                    <Pencil class="inline w-5 h-5" />
                                </a>
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <button
                on:click={() => startNewProject()}
                class="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
                <Plus class="w-5 h-5 mr-2" />
                Start nieuw project
            </button>
            
            <a
                href="/agenda"
                class="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
            >
                <Eye class="w-5 h-5 mr-2" />
                Agenda inplannen
            </a>
            
            <a
                href={`/client/edit/${clientData.$id}`}
                class="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors"
            >
                <Pencil class="w-5 h-5 mr-2" />
                Klant bewerken
            </a>
        </div>
    </div>
</div>