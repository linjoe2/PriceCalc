<script lang="ts">
    import { account, databases } from '$lib/appwrite';
    import { ID } from 'appwrite';
    import type { Subcontractor } from '$lib/types';
    
    let message = '';
    let error = '';
    let existingSubcontractors: Subcontractor[] = [];
    let selectedSubcontractor = 'new'; // 'new' or existing ID
    let subcontractor: Subcontractor = {
        name: '',
        email: '',
        phone: null,
        website: '',
        businessname: '',
    };

    // Fetch existing subcontractors on component mount
    async function fetchSubcontractors() {
        try {
            const response = await databases.listDocuments(
                'PriceCalc',
                '67af40c10023be6ed3e6'
            );
            existingSubcontractors = response.documents as unknown as Subcontractor[];
        } catch (e) {
            error = (e as Error).message;
        }
    }

    // Call this when component mounts
    fetchSubcontractors();

    // Handle subcontractor selection
    function handleSubcontractorSelect(event: Event) {
        const selected = (event.target as HTMLSelectElement).value;
        if (selected === 'new') {
            subcontractor = {
                name: '',
                email: '',
                phone: null,
                website: '',
                businessname: '',
                address: '',
            };
        } else {
            const found = existingSubcontractors.find(s => s.$id === selected);
            if (found) {
                subcontractor = {
                    $id: found.$id,
                    name: found.name,
                    email: found.email,
                    phone: found.phone,
                    website: found.website,
                    businessname: found.businessname,
                    address: found.address,
                };
            }
        }
    }

    async function createSubcontractor() {
        try {
            error = '';
            message = '';
            if (subcontractor.$id) {
                // Update document in subcontractors collection
                const response = await databases.updateDocument(
                    'PriceCalc',
                    '67af40c10023be6ed3e6',
                    subcontractor.$id,
                    subcontractor
                );
            } else {
                // Create document in subcontractors collection
            const response = await databases.createDocument(
                    'PriceCalc',
                    '67af40c10023be6ed3e6',
                    ID.unique(),
                    subcontractor
                );
            }
            
            message = 'Hoofdaannemer opgeslagen!';
            // Reset form
            subcontractor = {
                name: '',
                email: '',
                phone: null,
                website: '',
                businessname: '',
                address: '',
            };
            fetchSubcontractors();
        } catch (e) {
            error = (e as Error).message;
        }
    }
</script>

<div class="container mx-auto p-4 max-w-2xl">
    <h1 class="text-2xl font-bold mb-6">Hoofdaannemer aanmaken/bewerken</h1>
    
    {#if message}
        <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {message}
        </div>
    {/if}
    
    {#if error}
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
        </div>
    {/if}

    <form on:submit|preventDefault={createSubcontractor} class="space-y-4">
        <div>
            <label for="subcontractor-select" class="block mb-2">Selecteer Hoofdaannemer</label>
            <select
                id="subcontractor-select"
                bind:value={selectedSubcontractor}
                on:change={handleSubcontractorSelect}
                class="w-full p-2 border rounded mb-4"
            >
                <option value="new">Nieuwe Hoofdaannemer</option>
                {#each existingSubcontractors as sub}
                    <option value={sub.$id}>{sub.businessname}</option>
                {/each}
            </select>
        </div>
        <div>
            
            <label for="name" class="block mb-2">Bedrijfsnaam</label>
            <input
                type="text"
                id="name"
                bind:value={subcontractor.businessname}
                required
                class="w-full p-2 border rounded"
            />
        </div>


        <div>
            
            <label for="name" class="block mb-2">Naam</label>
            <input
                type="text"
                id="name"
                bind:value={subcontractor.name}
                required
                class="w-full p-2 border rounded"
            />
        </div>

        <div>
            <label for="email" class="block mb-2">Email</label>
            <input
                type="email"
                id="email"
                bind:value={subcontractor.email}
                required
                class="w-full p-2 border rounded"
            />
        </div>

        <div>
            <label for="phone" class="block mb-2">Telefoon</label>
            <input
                type="tel"
                id="phone"
                bind:value={subcontractor.phone}
                required
                class="w-full p-2 border rounded"
            />
        </div>

        <div>
            <label for="website" class="block mb-2">Website</label>
            <input
                type="text"
                id="website"
                bind:value={subcontractor.website}
                required
                class="w-full p-2 border rounded"
            />
        </div>

        <div>
            <label for="address" class="block mb-2">Adres</label>
            <input
                type="text"
                id="address"
                bind:value={subcontractor.address}
                required
                class="w-full p-2 border rounded"
            />
        </div>

        <button
            type="submit"
            class="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
        >
            
            Opslaan
        </button>
    </form>
</div>
