<script lang="ts">
    import { ID, Query } from "appwrite";
    import { client, databases } from "$lib/appwrite";
	import { on } from "svelte/events";
    import { onMount } from "svelte";
    import { chatwootContact } from "../../../stores/userStore";
    import type { ChatwootContact } from '$lib/types';
    import SavingAnimation from "../../../components/savingAnimation.svelte";
    import type { Subcontractor } from '$lib/types';
    let isSaving = false;
    let postcode = '';
    let houseNumber = '';
    let addressDetails = {};
    let naam = '';
    let achternaam: string | null = null;
    let bedrijfsnaam: string | null = null;
    let straat: string | null = null;
    let woonplaats: string | null = null;
    let email: string | null = null;
    let telefoonnummer: string | null = null;
    let oppervlakte: number | null = null;
    let bouwjaar: number | null = null;
    let chatwootid: string | null = null;
    let subcontractor: Subcontractor | null = null;
    let subcontractors: Subcontractor[] = [];

    async function fetchAddressDetails(postcode: string, houseNumber: string) {
        postcode = postcode.replace(/\s/g, '');
        if (postcode && houseNumber) {
            const response = await fetch('/api/address', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ postcode: postcode.replace(/\s/g, '').toUpperCase(), houseNumber })
            });

            if (response.ok) {
                addressDetails = await response.json();
                console.log(addressDetails)
                straat = addressDetails.straat
                woonplaats = addressDetails.woonplaats
                oppervlakte = addressDetails.oppervlakte
                bouwjaar = addressDetails.bouwjaar
            } else {
                console.error('Failed to fetch address details');
            }
        }


    }

    onMount(async () => {
        window.parent.postMessage('chatwoot-dashboard-app:fetch-info', '*');
        
        // Fetch subcontractors from database
        try {
            const result = await databases.listDocuments('PriceCalc', '67af40c10023be6ed3e6');
            subcontractors = result.documents as unknown as Subcontractor[];
        } catch (error) {
            console.error('Failed to fetch subcontractors:', error);
        }
    });

    async function updateContacts(chatwootContact: ChatwootContact){
        if(!!chatwootContact){
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

    $: updateContacts($chatwootContact)




    async function saveToAppwriteDB() {
        isSaving = true;

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
            subcontractor: subcontractor || null,
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
            // alert('Gebruiker succesvol toegevoegd aan de database.');
            window.location.href = `https://app.jhfbouw.nl/client/view/${result.$id}`;
        } catch (error) {
            console.error(error);
            alert('Er ging iets mis bij het toevoegen van de gebruiker aan de database.');
        } finally {
            isSaving = false;
        }
    }

    $: fetchAddressDetails(postcode, houseNumber);
</script>


<h1>Nieuwe klant</h1>
<form class="shadow-md rounded px-8 pt-6 pb-8 mb-4">
    <label for="naam" class="block text-sm font-medium text-gray-700">Naam*:</label>
    <input type="text" id="naam" bind:value={naam} required class="mt-1 block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
    
    <label for="achternaam" class="block text-sm font-medium text-gray-700">Achternaam:</label>
    <input type="text" id="achternaam" bind:value={achternaam} class="mt-1 block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
    
    <label for="bedrijfsnaam" class="block text-sm font-medium text-gray-700">Bedrijfsnaam:</label>
    <input type="text" id="bedrijfsnaam" bind:value={bedrijfsnaam} class="mt-1 block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
    
    <label for="postcode" class="block text-sm font-medium text-gray-700">Postcode*:</label>
    <input type="text" id="postcode" bind:value={postcode} required class="mt-1 block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
    
    <label for="huisnummer" class="block text-sm font-medium text-gray-700">Huisnummer*:</label>
    <input type="text" id="huisnummer" bind:value={houseNumber} required class="mt-1 block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
    
    <label for="adres" class="block text-sm font-medium text-gray-700">Straat:</label>
    <input type="text" id="adres" bind:value={straat} class="mt-1 block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
    
    <label for="stad" class="block text-sm font-medium text-gray-700">Woonplaats:</label>
    <input type="text" id="stad" bind:value={woonplaats} class="mt-1 block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
    <div class="flex justify-left">
        <div>
            <label for="oppervlakte" class="block text-sm font-medium text-gray-700">Oppervlakte:</label>
            <input type="text" id="oppervlakte" bind:value={oppervlakte} class="mt-1 block w-1/2 pl-3 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
        </div>
        <div>
            <label for="bouwjaar" class="block text-sm font-medium text-gray-700">Bouwjaar:</label>
            <input type="text" id="bouwjaar" bind:value={bouwjaar} class="mt-1 block w-1/2 pl-3 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
        </div>
    </div>
    <label for="email" class="block text-sm font-medium text-gray-700">Email:</label>
    <input type="email" id="email" bind:value={email} class="mt-1 block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
    
    <label for="telefoonnummer" class="block text-sm font-medium text-gray-700">Telefoonnummer:</label>
    <input type="tel" id="telefoonnummer" bind:value={telefoonnummer} class="mt-1 block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
    
    <label for="subcontractor" class="block text-sm font-medium text-gray-700">Onderaannemer:</label>
    <select 
        id="subcontractor" 
        bind:value={subcontractor} 
        class="mt-1 block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
    >
        <option value={null}>Selecteer een onderaannemer</option>
        {#each subcontractors as contractor}
            <option value={contractor}>{contractor.name}</option>
        {/each}
    </select>
    
    <button type="submit" class="mt-4 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500" on:click={saveToAppwriteDB}>Gegevens opslaan</button>
</form>
<SavingAnimation isVisible={isSaving} />