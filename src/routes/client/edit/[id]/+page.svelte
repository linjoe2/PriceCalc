<script lang="ts">
    import { Databases, Query } from "appwrite";
    import { client } from "$lib/appwrite";
    import { onMount } from "svelte";
    import { goto } from '$app/navigation';
    import { page } from '$app/stores';
    import Eye from "lucide-svelte/icons/eye";
    import Pencil from "lucide-svelte/icons/pencil";
    import SavingAnimation from "../../../../components/savingAnimation.svelte";
    import type { Subcontractor, Client } from "$lib/types";
    import ErrorMessage from "../../../../components/errorMessage.svelte";
    import SearchAdress from "../../../../components/searchAdress.svelte";
    let message: string | undefined;
    let error: string | undefined;
    let clientId = '';
    let clientData: Client = {
        type: '',
        name: '',
        businessname: '',
        adress: '',
        postcode: '',
        huisnummer: '',
        woonplaats: '',
        email: '',
        telefoonnummer: '',
        oppervlakte: 0,
        bouwjaar: 0,
        chatwootid: '',
        search: '',
    };
    let address: any;
    let postcode = '';
    let huisnummer = '';
    let addressDetails;
    let isSaving = false;
    let subcontractors: Subcontractor[] = [];

    $: clientData.search = `${clientData.name} ${clientData.lastname} ${clientData.businessname} ${clientData.postcode} ${clientData.huisnummer} ${clientData.telefoonnummer}`

    onMount(async () => {
        clientId = $page.params.id;
        const databases = new Databases(client);

        // Fetch subcontractors
        try {
            const subcontractorsResult = await databases.listDocuments('PriceCalc', '67af40c10023be6ed3e6');
            subcontractors = subcontractorsResult.documents as unknown as Subcontractor[];
        } catch (err) {
            console.error('Failed to fetch subcontractors:', err);
            error = 'Er ging iets fout bij het ophalen van de onderaannemers.';
        }

        // Check if clientId is an email address
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailRegex.test(clientId)) {
            // Query by email address
            const result = await databases.listDocuments('PriceCalc', '67362abc0039525e36b6', [
                Query.equal('email', clientId)
            ]);
            if (result.documents.length > 0) {
                clientData = result.documents[0] as unknown as Client;
                error = undefined;
            } else {
                console.error('No document found for the provided email address.');
                error = 'Er ging iets fout bij het ophalen van de klant.';
            }
        } else {
            // Query by client ID
            const result = await databases.getDocument('PriceCalc', '67362abc0039525e36b6', clientId);
            clientData = result as unknown as Client;
            postcode = result.postcode;
            huisnummer = result.huisnummer;
            clientData.subcontractors = result.subcontractors?.$id;
            error = undefined;
        }
        console.log(clientData);
    });

    async function updateClient() {
        isSaving = true;
        const databases = new Databases(client);
        try {
            clientData.postcode = clientData.postcode.replace(/\s+/g, '');
            const filteredClientData = Object.fromEntries(
                Object.entries(clientData).filter(([key]) => !key.startsWith('$'))
            ) as Partial<Client>;
            console.log(filteredClientData);

            
            await databases.updateDocument('PriceCalc', '67362abc0039525e36b6', clientId, filteredClientData);
            goto('/client');
            error = undefined;
        } catch (err) {
            console.log(err)
            error = 'Er ging iets mis bij het bijwerken van de gegevens.' + err;
        } finally {
            isSaving = false;
        }
    }

    async function updateAddress(address: any) {
        if(!!!address){
            console.log(address);
            clientData.adress = address.road;
            clientData.postcode = address.postcode;
            clientData.huisnummer = address.house_number;
            clientData.woonplaats = address.city || address.town || address.village || address.municipality;
        }
    }

    // $: updateAddress(address)

  
</script>
<h1 class="text-2xl font-bold text-gray-800 mb-4">Klant Gegevens Bewerken</h1>
<form on:submit|preventDefault={updateClient} class="shadow-md rounded px-8 pt-6 pb-8 mb-4 bg-white">
    
    <div class="mb-4">
        <label for="clientType" class="block text-sm font-medium text-gray-700">Type klant*:</label>
        <select 
            id="clientType" 
            bind:value={clientData.type} 
            required 
            class="mt-1 block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
            <option value="" disabled selected>Selecteer type klant</option>
            <option value="Prive">Prive</option>
            <option value="VVE">VVE</option>
            <option value="BV">BV</option>
        </select>
    </div>
    
    {#if clientData.type != 'Prive'}
        <div class="mb-4">
            <label for="bedrijfsnaam" class="block text-sm font-medium text-gray-700">Bedrijfsnaam:</label>
            <input type="text" id="bedrijfsnaam" bind:value={clientData.businessname} class="mt-1 block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
        </div>
    {/if}
    
    <div class="mb-4">
        <label for="naam" class="block text-sm font-medium text-gray-700">Naam geadresseerde:</label>
        <input type="text" id="naam" bind:value={clientData.name} required class="mt-1 block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
    </div>
    
  
    
    <SearchAdress bind:address={address} />

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
        <input type="text" id="straat" bind:value={clientData.adress}  class="mt-1 block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
    </div>
    
    <div class="mb-4">
        <label for="woonplaats" class="block text-sm font-medium text-gray-700">Woonplaats:</label>
        <input type="text" id="woonplaats" bind:value={clientData.woonplaats} class="mt-1 block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
    </div>
    

    
    <div class="mb-4">
        <label for="email" class="block text-sm font-medium text-gray-700">Email:</label>
        <input type="email" id="email" bind:value={clientData.email}  class="mt-1 block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
    </div>
    
    <div class="mb-4">
        <label for="telefoonnummer" class="block text-sm font-medium text-gray-700">Telefoonnummer:</label>
        <input type="tel" id="telefoonnummer" bind:value={clientData.telefoonnummer}  class="mt-1 block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
    </div>
    
    <ErrorMessage message={message} bind:error={error} />
    <button type="submit" class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Gegevens bijwerken</button>
</form>


<SavingAnimation isVisible={isSaving} />