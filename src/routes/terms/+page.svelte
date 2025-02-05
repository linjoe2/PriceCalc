<script>
    import { Databases } from 'appwrite';
    import { client } from '$lib/appwrite';
    import { onMount } from 'svelte';

    export let terms = [];
    export let projects = [];
    let newTerm = {
        text: '',
        checked: false
    };
    let isEditing = false;
    let editingTerm = null;

    const databaseId = 'PriceCalc'; // Replace with your actual database ID
    const collectionId = '67a280b30007409faa24'; // Replace with your actual collection ID


    const databases = new Databases(client);
    async function loadTerms() {
        try {
            const response = await databases.listDocuments(
                databaseId,
                collectionId
            );
            terms = response.documents.sort((a, b) => {
                if (a.checked === b.checked) return 0;
                return b.checked ? 1 : -1;
            });
        } catch (error) {
            console.error('Error loading terms:', error);
        }
    }

    async function addTerm() {
        try {
            await databases.createDocument(
                databaseId,
                collectionId,
                'unique()',
                { 
                    text: newTerm.text,
                    checked: newTerm.checked 
                }
            );
            newTerm = { text: '', checked: false };
            await loadTerms();
        } catch (error) {
            console.error('Error adding term:', error);
        }
    }

    async function updateTerm() {
        if(projects.length > 0) {
            isEditing = false;
            editingTerm = null;
            return;
        }
        try {
            await databases.updateDocument(
                databaseId,
                collectionId,
                editingTerm.$id,
                { 
                    text: editingTerm.text,
                    checked: editingTerm.checked 
                }
            );
            isEditing = false;
            editingTerm = null;
            await loadTerms();
        } catch (error) {
            console.error('Error updating term:', error);
        }
    }

    async function toggleChecked(term) {
        if(projects.length > 0) return;
        try {
            await databases.updateDocument(
                databaseId,
                collectionId,
                term.$id,
                { checked: !term.checked }
            );
            await loadTerms();
        } catch (error) {
            console.error('Error updating term:', error);
        }
    }

    async function deleteTerm(id) {
        if (confirm('Are you sure you want to delete this term?')) {
            try {
                await databases.deleteDocument(databaseId, collectionId, id);
                await loadTerms();
            } catch (error) {
                console.error('Error deleting term:', error);
            }
        }
    }

    function startEditing(term) {
        isEditing = true;
        editingTerm = { ...term };
    }

    onMount(() => {
        loadTerms();
    });
</script>

<div class="max-w-2xl mx-auto p-4">
    <h1 class="text-xl font-semibold mb-4">Voorwaarden</h1>


    <!-- List of terms -->
    <div class="space-y-2">
        {#each terms as term (term.$id)}
            <div class="flex items-center group hover:bg-gray-50 p-2 rounded-md">
                {#if isEditing && editingTerm?.$id === term.$id}
                    <div class="flex-1 flex gap-2">
                        <input
                            type="text"
                            bind:value={editingTerm.text}
                            class="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                            on:click={updateTerm}
                            class="text-green-600 hover:text-green-700"
                        >
                            ✓
                        </button>
                        <button
                            on:click={() => {
                                isEditing = false;
                                editingTerm = null;
                            }}
                            class="text-gray-600 hover:text-gray-700"
                        >
                            ✕
                        </button>
                    </div>
                {:else}
                    <input
                        type="checkbox"
                        checked={term.checked}
                        on:change={() => toggleChecked(term)}
                        class="w-4 h-4 mr-3"
                    />  
                    <span class="flex-1">{term.text}</span>
                    <div class="opacity-0 group-hover:opacity-100 flex gap-2">
                        <button
                            on:click={() => startEditing(term)}
                            class="text-gray-500 hover:text-gray-700"
                        >
                            ✎
                        </button>
                        <button
                            on:click={() => deleteTerm(term.$id)}
                            class="text-red-500 hover:text-red-700"
                        >
                            ×
                        </button>
                    </div>
                {/if}
            </div>
        {/each}
    </div>


    <!-- Add new term form -->
    <div class="mb-6">
        <div class="flex gap-2">
            <input
                type="text"
                bind:value={newTerm.text}
                placeholder="Voeg nieuwe voorwaarde toe"
                class="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            /> 
            <button
                on:click={addTerm}
                class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
                +
            </button>
        </div>
    </div>
</div>
