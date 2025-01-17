<script lang="ts">
    import { Databases, Query } from "appwrite";
    import { client } from "$lib/appwrite";
    import { onMount } from "svelte";
    import { goto } from '$app/navigation';
    import { page } from '$app/stores';
    import Eye from "lucide-svelte/icons/eye";
    import Pencil from "lucide-svelte/icons/pencil";

    let clientId = '';
    let clientData = {
        name: '',
        lastname: '',
        businessname: '',
        adress: '',
        postcode: '',
        huisnummer: '',
        woonplaats: '',
        email: '',
        telefoonnummer: 0,
        oppervlakte: 0,
        bouwjaar: 0,
        chatwootid: '',
        search: ''
        
    };

    $: clientData.search = `${clientData.name} ${clientData.lastname} ${clientData.businessname} ${clientData.postcode} ${clientData.huisnummer} ${clientData.telefoonnummer}`

    onMount(async () => {
        clientId = $page.params.id;
        const databases = new Databases(client);

        // Check if clientId is an email address
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailRegex.test(clientId)) {
            // Query by email address
            const result = await databases.listDocuments('PriceCalc', '67362abc0039525e36b6', [
                Query.equal('email', clientId)
            ]);
            if (result.documents.length > 0) {
                clientData = result.documents[0];
            } else {
                console.error('No document found for the provided email address.');
            }
        } else {
            // Query by client ID
            const result = await databases.getDocument('PriceCalc', '67362abc0039525e36b6', clientId);
            clientData = result;
        }
        console.log(clientData);


    });

    async function updateClient() {
        const databases = new Databases(client);
        try {
            const filteredClientData = Object.keys(clientData).reduce((acc, key) => {
                if (!key.startsWith('$')) {
                    acc[key] = clientData[key];
                }
                return acc;
            }, {});
            console.log(filteredClientData);
            await databases.updateDocument('PriceCalc', '67362abc0039525e36b6', clientId, filteredClientData);
            alert('Client gegevens succesvol bijgewerkt.');
            goto('/client');
        } catch (error) {
            console.error(error);
            alert('Er ging iets mis bij het bijwerken van de gegevens.');
        }
    }
</script>
<h1 class="text-2xl font-bold text-gray-800 mb-4">Klant Gegevens Bewerken</h1>
<form on:submit|preventDefault={updateClient} class="shadow-md rounded px-8 pt-6 pb-8 mb-4 bg-white">
    <div class="mb-4">
        <label for="naam" class="block text-sm font-medium text-gray-700">Naam:</label>
        <input type="text" id="naam" bind:value={clientData.name} required class="mt-1 block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
    </div>
    
    <div class="mb-4">
        <label for="achternaam" class="block text-sm font-medium text-gray-700">Achternaam:</label>
        <input type="text" id="achternaam" bind:value={clientData.lastname} required class="mt-1 block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
    </div>
    
    <div class="mb-4">
        <label for="bedrijfsnaam" class="block text-sm font-medium text-gray-700">Bedrijfsnaam:</label>
        <input type="text" id="bedrijfsnaam" bind:value={clientData.businessname} required class="mt-1 block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
    </div>
    
    <div class="mb-4">
        <label for="postcode" class="block text-sm font-medium text-gray-700">Postcode:</label>
        <input type="text" id="postcode" bind:value={clientData.postcode} required class="mt-1 block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
    </div>
    
    <div class="mb-4">
        <label for="huisnummer" class="block text-sm font-medium text-gray-700">Huisnummer:</label>
        <input type="text" id="huisnummer" bind:value={clientData.huisnummer} required class="mt-1 block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
    </div>
    
    <div class="mb-4">
        <label for="straat" class="block text-sm font-medium text-gray-700">Straat:</label>
        <input type="text" id="straat" bind:value={clientData.adress} required class="mt-1 block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
    </div>
    
    <div class="mb-4">
        <label for="woonplaats" class="block text-sm font-medium text-gray-700">Woonplaats:</label>
        <input type="text" id="woonplaats" bind:value={clientData.woonplaats} required class="mt-1 block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
    </div>
    
    <div class="mb-4">
        <label for="oppervlakte" class="block text-sm font-medium text-gray-700">Oppervlakte:</label>
        <input type="number" id="oppervlakte" bind:value={clientData.oppervlakte}  class="mt-1 block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
    </div>
    
    <div class="mb-4">
        <label for="bouwjaar" class="block text-sm font-medium text-gray-700">Bouwjaar:</label>
        <input type="number" id="bouwjaar" bind:value={clientData.bouwjaar}  class="mt-1 block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
    </div>
    
    <div class="mb-4">
        <label for="email" class="block text-sm font-medium text-gray-700">Email:</label>
        <input type="email" id="email" bind:value={clientData.email}  class="mt-1 block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
    </div>
    
    <div class="mb-4">
        <label for="telefoonnummer" class="block text-sm font-medium text-gray-700">Telefoonnummer:</label>
        <input type="number" id="telefoonnummer" bind:value={clientData.telefoonnummer}  class="mt-1 block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
    </div>
    
    <button type="submit" class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Gegevens bijwerken</button>
</form>


