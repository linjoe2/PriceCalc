<script lang="ts">
    import { Databases } from 'appwrite';
    import { client } from '$lib/appwrite';
    import { onMount } from 'svelte';
    import type { Term, Project } from '$lib/types';
    import type { Models } from 'appwrite';

    export let terms: Term[] = [];
    export let projects: Project[] = [];
    let newTerm = {
        text: '',
        checked: false
    };
    let isEditing = false;
    let editingTerm: Term | null = null;

    const databaseId = 'PriceCalc';
    const collectionId = '67a280b30007409faa24';

    const databases = new Databases(client);
    async function loadTerms() {
        try {
            const response = await databases.listDocuments<Models.Document & { text: string; checked: boolean; order: number }>(
                databaseId,
                collectionId
            );
            const loadedTerms = response.documents.map(doc => ({
                ...doc,
                projectId: doc.projectId || '',
                order: doc.order || 0
            })).sort((a, b) => {
                // First sort by order
                if (a.order !== b.order) return a.order - b.order;
                // Then by checked status
                if (a.checked !== b.checked) return b.checked ? 1 : -1;
                return 0;
            });

            // If we're in project context, merge the loaded terms with existing selected terms
            if (projects.length > 0) {
                // Create a map of existing terms by their text to preserve checked state
                const existingTermsMap = new Map(terms.map(term => [term.text, term]));
                
                // Merge loaded terms with existing terms, preserving checked state
                terms = loadedTerms.map(loadedTerm => ({
                    ...loadedTerm,
                    checked: existingTermsMap.get(loadedTerm.text)?.checked || false
                }));
            } else {
                terms = loadedTerms;
            }
        } catch (error) {
            console.error('Error loading terms:', error);
        }
    }

    async function addTerm() {
        try {
            // Get the highest order value
            const maxOrder = terms.length > 0 ? Math.max(...terms.map(t => t.order || 0)) : -1;
            await databases.createDocument(
                databaseId,
                collectionId,
                'unique()',
                { 
                    text: newTerm.text,
                    checked: newTerm.checked,
                    order: maxOrder + 1
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
                editingTerm?.$id,
                { 
                    text: editingTerm?.text,
                    checked: editingTerm?.checked 
                }
            );
            isEditing = false;
            editingTerm = null;
            await loadTerms();
        } catch (error) {
            console.error('Error updating term:', error);
        }
    }

    async function toggleChecked(term: Term) {
        if(projects.length > 0) {
            // When in project context, just update the local state
            term.checked = !term.checked;
            terms = [...terms]; // Trigger reactivity
            return;
        }
        try {
            if (!term.$id) return;
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

    async function deleteTerm(id: string | undefined) {
        if (!id) return;
        if (confirm('Are you sure you want to delete this term?')) {
            try {
                await databases.deleteDocument(
                    databaseId,
                    collectionId,
                    id
                );
                await loadTerms();
            } catch (error) {
                console.error('Error deleting term:', error);
            }
        }
    }

    async function saveEdit() {
        if (!editingTerm || !editingTerm.$id) return;
        try {
            await databases.updateDocument(
                databaseId,
                collectionId,
                editingTerm.$id,
                { 
                    text: editingTerm.text,
                    checked: editingTerm.checked,
                    order: editingTerm.order
                }
            );
            isEditing = false;
            editingTerm = null;
            await loadTerms();
        } catch (error) {
            console.error('Error updating term:', error);
        }
    }

    function startEdit(term: Term) {
        if (!term) return;
        editingTerm = { ...term };
        isEditing = true;
    }

    function cancelEdit() {
        isEditing = false;
        editingTerm = null;
    }

    let draggedIndex: number | null = null;

    function handleDragStart(event: DragEvent, index: number) {
        draggedIndex = index;
        if (event.dataTransfer) {
            event.dataTransfer.effectAllowed = 'move';
        }
        const target = event.target as HTMLElement;
        target.closest('.term-item')?.classList.add('dragging');
    }

    function handleDragEnd(event: DragEvent) {
        const target = event.target as HTMLElement;
        target.closest('.term-item')?.classList.remove('dragging');
        draggedIndex = null;
    }

    async function handleDragOver(event: DragEvent, index: number) {
        event.preventDefault();
        if (draggedIndex === null || draggedIndex === index) return;
        
        // Reorder the terms array
        const termsArray = [...terms];
        const draggedTerm = termsArray[draggedIndex];
        termsArray.splice(draggedIndex, 1);
        termsArray.splice(index, 0, draggedTerm);
        
        // Update order values
        termsArray.forEach((term, i) => {
            term.order = i;
        });
        
        terms = termsArray;
        draggedIndex = index;

        // Update order in database
        try {
            await Promise.all(terms.map(term => {
                if (!term.$id) return Promise.resolve();
                return databases.updateDocument(
                    databaseId,
                    collectionId,
                    term.$id,
                    { order: term.order }
                );
            }));
        } catch (error) {
            console.error('Error updating term order:', error);
        }
    }

    onMount(() => {
        loadTerms();
    });
</script>

<div class="max-w-2xl mx-auto p-4">
    <h2 class="text-xl font-semibold mb-4">Voorwaarden</h2>

    <!-- Selected Terms Section -->
    <div class="mb-6">
        <h3 class="text-lg font-medium mb-2">Geselecteerde Voorwaarden</h3>
        <div class="space-y-2">
            {#each terms.filter(t => t.checked) as term (term.$id)}
                <div 
                    class="flex items-center group hover:bg-gray-50 p-2 rounded-md term-item bg-blue-50 border border-blue-200"
                    draggable="true"
                    on:dragstart={(e) => handleDragStart(e, terms.indexOf(term))}
                    on:dragend={handleDragEnd}
                    on:dragover={(e) => handleDragOver(e, terms.indexOf(term))}
                >
                    {#if isEditing && editingTerm?.$id === term.$id}
                        <div class="flex-1 flex gap-2">
                            <input
                                type="text"
                                bind:value={editingTerm.text}
                                class="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                                on:click={saveEdit}
                                class="text-green-600 hover:text-green-700"
                            >
                                ✓
                            </button>
                            <button
                                on:click={cancelEdit}
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
                                on:click={() => startEdit(term)}
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
            {#if terms.filter(t => t.checked).length === 0}
                <p class="text-gray-500 italic">Geen voorwaarden geselecteerd</p>
            {/if}
        </div>
    </div>

    <!-- Available Terms Section -->
    <div>
        <h3 class="text-lg font-medium mb-2">Beschikbare Voorwaarden</h3>
        <div class="space-y-2">
            {#each terms.filter(t => !t.checked) as term (term.$id)}
                <div 
                    class="flex items-center group hover:bg-gray-50 p-2 rounded-md term-item"
                    draggable="true"
                    on:dragstart={(e) => handleDragStart(e, terms.indexOf(term))}
                    on:dragend={handleDragEnd}
                    on:dragover={(e) => handleDragOver(e, terms.indexOf(term))}
                >
                    {#if isEditing && editingTerm?.$id === term.$id}
                        <div class="flex-1 flex gap-2">
                            <input
                                type="text"
                                bind:value={editingTerm.text}
                                class="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                                on:click={saveEdit}
                                class="text-green-600 hover:text-green-700"
                            >
                                ✓
                            </button>
                            <button
                                on:click={cancelEdit}
                                class="text-gray-598 hover:text-gray-700"
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
                                on:click={() => startEdit(term)}
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
    </div>

    <!-- Add new term form -->
    <div class="mt-6">
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
