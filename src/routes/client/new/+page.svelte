<script lang="ts">
    import { ID, Query } from "appwrite";
    import { client, databases } from "$lib/appwrite";
	import { on } from "svelte/events";
    import { onMount } from "svelte";
    import { chatwootContact } from "../../../stores/userStore";
    import type { ChatwootContact } from '$lib/types';
    import SavingAnimation from "../../../components/savingAnimation.svelte";
    import type { Subcontractor } from '$lib/types';
    import ErrorMessage from "../../../components/errorMessage.svelte";
    import SearchAdress from "../../../components/searchAdress.svelte";
    let message: string | undefined;
    let error: string | undefined;
    let isSaving = false;
    let postcode = '';
    let houseNumber = '';
    interface AddressDetails {
        straat: string;
        woonplaats: string;
        oppervlakte: string;
        bouwjaar: string;
    }

    let addressDetails: AddressDetails = {
        straat: '',
        woonplaats: '',
        oppervlakte: '',
        bouwjaar: ''
    };
    let naam = '';
    let achternaam: string | null = null;
    let bedrijfsnaam: string | null = null;
    let straat: string | null = null;
    let woonplaats: string | null = null;
    let email: string | null = null;
    let telefoonnummer: string;
    let oppervlakte: string;
    let bouwjaar: string;
    let chatwootid: string | null = null;
    let subcontractor: Subcontractor | null = null;
    let subcontractors: Subcontractor[] = [];
    let address: string | null = null;

    onMount(async () => {
        window.parent.postMessage('chatwoot-dashboard-app:fetch-info', '*');
        
        // Fetch subcontractors from database
        try {
            const result = await databases.listDocuments('PriceCalc', '67af40c10023be6ed3e6');
            console.log(result);
            subcontractors = result.documents as unknown as Subcontractor[];
            error = undefined;
        } catch (error) {
            console.error('Failed to fetch subcontractors:', error);
            error = 'Er ging iets fout bij het ophalen van de onderaannemers.';
        }
    });

    async function updateContacts(chatwootContact: ChatwootContact | null) {
        if (chatwootContact) {
            // check if chatwoot contact exists id database
            const result = await databases.listDocuments('PriceCalc', '67362abc0039525e36b6', [Query.equal('chatwootid', chatwootContact.id)]);
            console.log(result);
            if(result.total > 0){
                window.location.href = `https://app.jhfbouw.nl/client/edit/${result.documents[0].$id}`;
            }else{
            const names = chatwootContact.name.split(' ');
            naam = names[0]; // First name
            achternaam = names.slice(1).join(' '); // Last name (rest of the names)
            email = chatwootContact.email;
            postcode = chatwootContact.custom_attributes.postcode;
            houseNumber = chatwootContact.custom_attributes.huisnummer;
            chatwootid = chatwootContact.id;
            telefoonnummer = chatwootContact.phone_number || chatwootContact.custom_attributes.phone;
            }
        }
    }


    async function updateAddress(address: any) {
        if(!!!address){
            console.log(address);
            woonplaats = address.city || address.town || address.village || address.municipality;
            straat = address.road;
            postcode = address.postcode;
            houseNumber = address.house_number;
        }
    }
    $: updateAddress(address)

    $: updateContacts($chatwootContact)



    async function saveToAppwriteDB() {
        isSaving = true;
        //postcode trim spaces and remove spaces
        postcode = postcode.replace(/\s+/g, '');
        const user = {
            name: naam,
            lastname: achternaam,
            businessname: bedrijfsnaam,
            adress: straat,
            postcode: postcode,
            huisnummer: houseNumber,
            woonplaats: woonplaats,
            oppervlakte: parseInt(oppervlakte),
            bouwjaar: parseInt(bouwjaar),
            email: email,
            telefoonnummer: parseInt(telefoonnummer),
            chatwootid: chatwootid || null,
            subcontractors: subcontractor || null,
            search: `${naam} ${achternaam} ${bedrijfsnaam} ${postcode} ${houseNumber} ${telefoonnummer}`
        };

        try {
            console.log(user);
            const result = await databases.createDocument(
                'PriceCalc',
                '67362abc0039525e36b6',
                ID.unique(),
                user
            );
            console.log(result);
            message = 'Gebruiker succesvol toegevoegd aan de database.';
            window.location.href = `https://app.jhfbouw.nl/client/view/${result.$id}`;
        } catch (err) {
            console.error(err);
            error = 'Er ging iets mis bij het toevoegen van de gebruiker aan de database.' + err;
        } finally {
            isSaving = false;
        }
    }

</script>


<h1>Nieuwe klant</h1>
<ErrorMessage message={message} error={error} />
<form class="shadow-md rounded px-8 pt-6 pb-8 mb-4">
    <label for="naam" class="block text-sm font-medium text-gray-700">Naam*:</label>
    <input type="text" id="naam" bind:value={naam} required class="mt-1 block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
    
    <label for="achternaam" class="block text-sm font-medium text-gray-700">Achternaam:</label>
    <input type="text" id="achternaam" bind:value={achternaam} class="mt-1 block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
    
    <label for="bedrijfsnaam" class="block text-sm font-medium text-gray-700">Bedrijfsnaam:</label>
    <input type="text" id="bedrijfsnaam" bind:value={bedrijfsnaam} class="mt-1 block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
    
    <label for="subcontractor" class="block text-sm font-medium text-gray-700">Hoofdaannemer:</label>
    <select 
        id="subcontractor" 
        bind:value={subcontractor} 
        class="mt-1 block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
    >
        <option value={null}>Geen hoofdaannemer</option>
        {#each subcontractors as contractor}
            <option value={contractor.$id}>{contractor.businessname}</option>
        {/each}
    </select>

    <SearchAdress bind:address={address} />
    
    <label for="postcode" class="block text-sm font-medium text-gray-700">Postcode*:</label>
    <input type="text" id="postcode" bind:value={postcode} required class="mt-1 block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
    
    <label for="huisnummer" class="block text-sm font-medium text-gray-700">Huisnummer*:</label>
    <input type="text" id="huisnummer" bind:value={houseNumber} required class="mt-1 block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
    
    <label for="adres" class="block text-sm font-medium text-gray-700">Straat:</label>
    <input type="text" id="adres" bind:value={straat} class="mt-1 block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
    
    <label for="stad" class="block text-sm font-medium text-gray-700">Woonplaats:</label>
    <input type="text" id="stad" bind:value={woonplaats} class="mt-1 block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
  
    <label for="email" class="block text-sm font-medium text-gray-700">Email:</label>
    <input type="email" id="email" bind:value={email} class="mt-1 block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
    
    <label for="telefoonnummer" class="block text-sm font-medium text-gray-700">Telefoonnummer:</label>
    <input type="tel" id="telefoonnummer" bind:value={telefoonnummer} class="mt-1 block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
    
    
    
    <button type="submit" class="mt-4 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500" on:click={saveToAppwriteDB}>Gegevens opslaan</button>
</form>
<SavingAnimation isVisible={isSaving} />