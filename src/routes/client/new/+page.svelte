<script>
    import { Databases, ID } from "appwrite";
    import { client } from "$lib/appwrite";

    let postcode = '';
    let houseNumber = '';
    let addressDetails = {};
    let naam = '';
    let achternaam = '';
    let bedrijfsnaam = '';
    let straat = '';
    let woonplaats = '';
    let email = '';
    let telefoonnummer = '';
    let oppervlakte = '';
    let bouwjaar = '';

    async function fetchAddressDetails(postcode, houseNumber) {
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


    async function saveToAppwriteDB() {
        const databases = new Databases(client);



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
            telefoonnummer: parseInt(telefoonnummer)
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
            alert('Gebruiker succesvol toegevoegd aan de database.');
        } catch (error) {
            console.error(error);
            alert('Er ging iets mis bij het toevoegen van de gebruiker aan de database.');
        }
    }

    $: fetchAddressDetails(postcode, houseNumber);
</script>
<h1>Nieuwe klant</h1>
<form on:submit|preventDefault={fetchAddressDetails} class="shadow-md rounded px-8 pt-6 pb-8 mb-4">
    <label for="naam" class="block text-sm font-medium text-gray-700">Naam:</label>
    <input type="text" id="naam" bind:value={naam} required class="mt-1 block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
    
    <label for="achternaam" class="block text-sm font-medium text-gray-700">Achternaam:</label>
    <input type="text" id="achternaam" bind:value={achternaam} required class="mt-1 block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
    
    <label for="bedrijfsnaam" class="block text-sm font-medium text-gray-700">Bedrijfsnaam:</label>
    <input type="text" id="bedrijfsnaam" bind:value={bedrijfsnaam} required class="mt-1 block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
    
    <label for="postcode" class="block text-sm font-medium text-gray-700">Postcode:</label>
    <input type="text" id="postcode" bind:value={postcode} required class="mt-1 block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
    
    <label for="huisnummer" class="block text-sm font-medium text-gray-700">Huisnummer:</label>
    <input type="text" id="huisnummer" bind:value={houseNumber} required class="mt-1 block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
    
    <label for="adres" class="block text-sm font-medium text-gray-700">Straat:</label>
    <input type="text" id="adres" bind:value={straat} required class="mt-1 block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
    
    <label for="stad" class="block text-sm font-medium text-gray-700">Woonplaats:</label>
    <input type="text" id="stad" bind:value={woonplaats} required class="mt-1 block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
    <div class="flex justify-left">
        <div>
            <label for="oppervlakte" class="block text-sm font-medium text-gray-700">Oppervlakte:</label>
            <input type="text" id="oppervlakte" bind:value={oppervlakte} required class="mt-1 block w-1/2 pl-3 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
        </div>
        <div>
            <label for="bouwjaar" class="block text-sm font-medium text-gray-700">Bouwjaar:</label>
            <input type="text" id="bouwjaar" bind:value={bouwjaar} required class="mt-1 block w-1/2 pl-3 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
        </div>
    </div>
    <label for="email" class="block text-sm font-medium text-gray-700">Email:</label>
    <input type="email" id="email" bind:value={email} required class="mt-1 block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
    
    <label for="telefoonnummer" class="block text-sm font-medium text-gray-700">Telefoonnummer:</label>
    <input type="tel" id="telefoonnummer" bind:value={telefoonnummer} required class="mt-1 block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
    
    <button type="submit" class="mt-4 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500" on:click={saveToAppwriteDB}>Gegevens opslaan</button>
</form>
