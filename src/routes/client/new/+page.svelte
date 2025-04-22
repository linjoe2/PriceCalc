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
    let type: string | null = null;
    let bedrijfsnaam: string | null = null;
    let straat: string | null = null;
    let woonplaats: string | null = null;
    let email: string | null = null;
    let telefoonnummer: string;
    let oppervlakte: string;
    let bouwjaar: string;
    let chatwootid: string | null = null;
    let address: string | null = null;

    onMount(async () => {
        window.parent.postMessage('chatwoot-dashboard-app:fetch-info', '*');
        
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
            email = chatwootContact.email;
            postcode = chatwootContact.custom_attributes.postcode;
            houseNumber = chatwootContact.custom_attributes.huisnummer;
            chatwootid = chatwootContact.id;
            telefoonnummer = chatwootContact.phone_number || chatwootContact.custom_attributes.phone;
            }
        }
    }


    async function updateAddress(address: any) {
        console.log('address', address);
        if(!!address){
            console.log(address);
            woonplaats = address.city || address.town || address.village || address.municipality;
            straat = address.road + ' ' + address.house_number;
            postcode = address.postcode;
        }
    }
    $: updateAddress(address)

    $: updateContacts($chatwootContact)



    async function saveToAppwriteDB() {
        isSaving = true;
        //postcode trim spaces and remove spaces
        postcode = postcode.replace(/\s+/g, '');
        const user = {
            type: type,
            name: naam,
            businessname: bedrijfsnaam,
            adress: straat,
            postcode: postcode,
            woonplaats: woonplaats,
            email: email,
            telefoonnummer: telefoonnummer,
            chatwootid: chatwootid || null,
            search: `${naam} ${bedrijfsnaam} ${postcode} ${houseNumber} ${telefoonnummer}`
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

    <label for="clientType" class="block text-sm font-medium text-gray-700">Type klant*:</label>
    <select id="clientType" bind:value={type} required class="mt-1 block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
        <option value="" disabled selected>Selecteer type klant</option>
        <option value="Particulier">Particulier</option>
        <option value="VVE">VVE</option>
        <option value="Bedrijf">Bedrijf met BTW</option>
        <option value="BedrijfZonderBTW">Bedrijf zonder BTW</option>
    </select>
    {#if type != 'Particulier'}
        <label for="bedrijfsnaam" class="block text-sm font-medium text-gray-700">Bedrijfsnaam:</label>
        <input type="text" id="bedrijfsnaam" bind:value={bedrijfsnaam} class="mt-1 block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
    {/if}

    <label for="naam" class="block text-sm font-medium text-gray-700">Naam geadresseerde*:</label>
    <input type="text" id="naam" bind:value={naam} required class="mt-1 block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />


    <SearchAdress bind:address={address} />
    
   

    <label for="adres" class="block text-sm font-medium text-gray-700">adress:</label>
    <input type="text" id="adres" bind:value={straat} class="mt-1 block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
   
    <label for="stad" class="block text-sm font-medium text-gray-700">Woonplaats:</label>
    <input type="text" id="stad" bind:value={woonplaats} class="mt-1 block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
 
    <label for="postcode" class="block text-sm font-medium text-gray-700">Postcode*:</label>
    <input type="text" id="postcode" bind:value={postcode} required class="mt-1 block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
  
    <label for="email" class="block text-sm font-medium text-gray-700">Email:</label>
    <input type="email" id="email" bind:value={email} class="mt-1 block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
    
    <label for="telefoonnummer" class="block text-sm font-medium text-gray-700">Telefoonnummer:</label>
    <input type="tel" id="telefoonnummer" bind:value={telefoonnummer} class="mt-1 block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
    
    
    
    <button type="submit" class="mt-4 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500" on:click={saveToAppwriteDB}>Gegevens opslaan</button>
</form>
<SavingAnimation isVisible={isSaving} />