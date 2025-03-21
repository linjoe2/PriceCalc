<script lang="ts">
import { onMount } from 'svelte';
import { Databases, ID, Query } from "appwrite";
import { client } from "$lib/appwrite";
import CreateTasks from '../../components/createTasks.svelte';
import type { Service } from '$lib/types';
import ErrorMessage from '../../components/errorMessage.svelte';

const databases = new Databases(client);
const databaseId = 'PriceCalc'; // Your database ID
const collectionId = '6735eb1000013509eaf3'; // Your collection ID

let services = {};
let error: string | undefined;

// New reactive variable for selected category
let selectedCategory = ''; // Initialize selectedCategory

// New reactive variable for the edit dialog
let isEditDialogOpen = false; // Manage dialog visibility
let serviceToEdit: Service | null = null; // Store the service being edited

// New reactive variable to track visibility of taken for each service
let tasksVisibility = {};

// Add this near the top with other reactive variables
let serviceToDelete = null; // Store service to be deleted
let showDeleteConfirmation = false; // Control visibility of delete confirmation dialog

onMount(async () => {
    fetchServices();
});

async function fetchServices() {
    try {
        const response = await databases.listDocuments(databaseId, collectionId, [Query.limit(100), Query.offset(0)]);
        console.log(response);
        services = response.documents.reduce((acc, doc, index) => {
            const { category, subcategory, type, price, unit, $id, tasks, order } = doc;
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push({ subcategory, type, price, unit, $id, tasks, order });
            return acc;
        }, {});

        // Sort categories based on the order of the first item in each category
        services = Object.fromEntries(
            Object.entries(services).sort(([, a], [, b]) => a[0].order - b[0].order)
        );

        console.log(services);
    } catch (error) {
        console.error('Error fetching services:', error);
    }
}

// New variables for the editor
let newService = {
    subcategory: '',
    type: '',
    price: '',
    unit: '',
    tasks: ''
};

function addService(category: string) {
    if (newService.subcategory && newService.type && newService.price && newService.unit) {
        // Calculate the orderIndex as a decimal
        const categoryIndex = Object.keys(services).indexOf(category) + 1;
        const subcategoryIndex = services[category].length + 1;
        const order = parseFloat(`${categoryIndex}.${subcategoryIndex}`);
        services[category].push({ ...newService, order });
        resetNewService();
    }
}

function resetNewService() {
    newService = {
        subcategory: '',
        type: '',
        price: '',
        unit: '',
        tasks: '',
        order: ''
    };
}

// Function to update an existing service
function updateService(category: string, index: number, updatedService: Service) {
    // Ensure the orderIndex is preserved
    // updatedService.order = services[category][index].order;
    // services[category][index] = updatedService;
}

// Function to delete a service
function confirmDelete(category: string, index: number) {
    serviceToDelete = { category, index };
    showDeleteConfirmation = true;
}

async function deleteService() {
    if (!serviceToDelete) return;
    
    const { category, index } = serviceToDelete;
    try {
        const response = await databases.deleteDocument(databaseId, collectionId, services[category][index].$id);
        console.log('Service deleted successfully:', response);
        services[category].splice(index, 1);
        services = services;
    } catch (error) {
        console.error('Error deleting service:', error);
    }
    showDeleteConfirmation = false;
    serviceToDelete = null;
}

// Function to open the edit dialog
function editService(category: string, index: number, service: Service) {
    serviceToEdit = { ...service, category, index }; // Store the service details
    serviceToEdit.tasks = JSON.parse(serviceToEdit.tasks || '[]');
    isEditDialogOpen = true; // Open the dialog
}

// Function to save the edited service
async function saveEditedService() {
    if (serviceToEdit) {
        if (serviceToEdit.$id) {
            updateService(serviceToEdit.category, serviceToEdit.index, serviceToEdit);
            isEditDialogOpen = false; // Close the dialog
            resetNewService(); // Reset new service fields if needed
            serviceToEdit.tasks = JSON.stringify(serviceToEdit.tasks);
            try {
                const response = await databases.updateDocument(databaseId, collectionId, serviceToEdit.$id, {
                    subcategory: serviceToEdit.subcategory,
                    type: serviceToEdit.type,
                    price: parseInt(serviceToEdit.price),
                    unit: serviceToEdit.unit,
                    category: serviceToEdit.category, // Optionally include the category
                    tasks: serviceToEdit.tasks, // Include taken
                    order: serviceToEdit.order // Include order
                });
                console.log('Service saved and updated successfully:', response);
            } catch (error) {
                console.error('Error saving and updating service:', error);
            }
        } else {
            // If no $id, create a new item
            services[serviceToEdit.category].push(serviceToEdit);
            isEditDialogOpen = false; // Close the dialog
            resetNewService(); // Reset new service fields if needed
            try {
                const response = await databases.createDocument(databaseId, collectionId, ID.unique(), {
                    subcategory: serviceToEdit.subcategory,
                    type: serviceToEdit.type,
                    price: parseInt(serviceToEdit.price),
                    unit: serviceToEdit.unit,
                    category: serviceToEdit.category, // Optionally include the category
                    tasks: JSON.stringify(serviceToEdit.tasks), // Include taken
                    order: serviceToEdit.order // Include order
                });
                console.log('Service created successfully:', response);
                fetchServices();
            } catch (error) {
                console.error('Error creating service:', error);
            }
        }
    }
}

let newCategory = '';

function createNewCategory() {
    services[newCategory] = [];
    selectedCategory = newCategory;
}

function toggletasksVisibility(category, index) {
    const key = `${category}-${index}`;
    tasksVisibility[key] = !tasksVisibility[key];
}

async function changeCategoryName(category: string, newName: string) {
    services[newName] = services[category];
    delete services[category];

    //update the category name in the database
    for (const service of services[newName]) {
        const response = await databases.updateDocument(databaseId, collectionId, service.$id, {
            category: newName
        });
        console.log(response);
    }


    showInput = false;
}
let showInput = false;
let newCategoryName = '';

// Add these new functions for drag and drop
function handleDragStart(event: DragEvent, category: string, index: number) {
    if (event.dataTransfer) {
        event.dataTransfer.setData('text/plain', JSON.stringify({
            sourceCategory: category,
            sourceIndex: index
        }));
    }
}

// Function to update the order index of services
function updateOrderIndex(category: string) {
    services[category].forEach((service, index) => {
        const categoryIndex = Object.keys(services).indexOf(category) + 1;
        const subcategoryIndex = index + 1;
        service.order = parseFloat(`${categoryIndex}.${subcategoryIndex}`);
    });
}

// Modify handleDrop to update order index and save changes to the database
function handleDrop(event: DragEvent, targetCategory: string, targetIndex: number) {
    event.preventDefault();
    if (event.dataTransfer) {
        const data = JSON.parse(event.dataTransfer.getData('text/plain'));
        const { sourceCategory, sourceIndex } = data;
        
        // Get the service to move
        const serviceToMove = services[sourceCategory][sourceIndex];
        
        // Remove from original position
        services[sourceCategory].splice(sourceIndex, 1);
        
        // Add to new position
        services[targetCategory].splice(targetIndex, 0, serviceToMove);
        
        // Update the order index
        updateOrderIndex(targetCategory);
        if (sourceCategory !== targetCategory) {
            updateOrderIndex(sourceCategory);
        }
        
        // Update the category in the database if it changed
        if (sourceCategory !== targetCategory) {
            updateServiceCategory(serviceToMove.$id, targetCategory);
        }
        
        // Save the updated order to the database
        saveOrderChangesToDatabase(targetCategory);
        if (sourceCategory !== targetCategory) {
            saveOrderChangesToDatabase(sourceCategory);
        }
        
        // Force Svelte to update the view
        services = services;
    }
}

// New function to save order changes to the database
async function saveOrderChangesToDatabase(category: string) {
    try {
        for (const service of services[category]) {
            console.log(service.order);
            await databases.updateDocument(databaseId, collectionId, service.$id, {
                order: JSON.stringify(service.order)
            });
        }
        console.log(`Order changes saved for category: ${category}`);
    } catch (error) {
        console.error('Error saving order changes:', error);
    }
}

function handleDragOver(event: DragEvent) {
    event.preventDefault();
}

async function updateServiceCategory(serviceId: string, newCategory: string) {
    try {
        await databases.updateDocument(databaseId, collectionId, serviceId, {
            category: newCategory
        });
    } catch (error) {
        console.error('Error updating service category:', error);
    }
}

// Add this new function after the updateServiceCategory function
async function duplicateService(category: string, index: number) {
    const serviceToDuplicate = services[category][index];
    const duplicatedService = {
        ...serviceToDuplicate,
        $id: ID.unique() // Generate new unique ID
    };
    
    try {
        const response = await databases.createDocument(
            databaseId, 
            collectionId, 
            duplicatedService.$id,
            {
                subcategory: serviceToDuplicate.subcategory,
                type: serviceToDuplicate.type,
                price: parseInt(serviceToDuplicate.price),
                unit: serviceToDuplicate.unit,
                category: category,
                tasks: serviceToDuplicate.tasks
            }
        );
        console.log('Service duplicated successfully:', response);
        // Refresh the services to show the new duplicate
        await fetchServices();
    } catch (error) {
        console.error('Error duplicating service:', error);
    }
}

// Ensure services are sorted by order before rendering
$: {
    for (const category in services) {
        services[category].sort((a, b) => a.order - b.order);
    }
}

// Function to move a category up
function moveCategoryUp(category: string) {
    const categories = Object.keys(services);
    const index = categories.indexOf(category);
    if (index > 0) {
        const temp = categories[index - 1];
        categories[index - 1] = categories[index];
        categories[index] = temp;
        reorderCategories(categories);
    }
}

// Function to move a category down
function moveCategoryDown(category: string) {
    const categories = Object.keys(services);
    const index = categories.indexOf(category);
    if (index < categories.length - 1) {
        const temp = categories[index + 1];
        categories[index + 1] = categories[index];
        categories[index] = temp;
        reorderCategories(categories);
    }
}

// Helper function to reorder categories and save changes to the database
async function reorderCategories(newOrder: string[]) {
    services = newOrder.reduce((acc, category) => {
        acc[category] = services[category];
        return acc;
    }, {});

    // Save the new order to the database
    await saveCategoryOrderToDatabase(newOrder);
}

// New function to save category order to the database
async function saveCategoryOrderToDatabase(newOrder: string[]) {
    try {
        for (let i = 0; i < newOrder.length; i++) {
            const category = newOrder[i];
            for (let j = 0; j < services[category].length; j++) {
                const service = services[category][j];
                // Update the order index for each service
                const categoryIndex = i + 1;
                const subcategoryIndex = j + 1;
                service.order = `${categoryIndex}.${subcategoryIndex}`;

                // Save the updated order to the database
                await databases.updateDocument(databaseId, collectionId, service.$id, {
                    order: service.order
                });
            }
        }
        console.log('Category and subcategory order saved successfully');
    } catch (error) {
        console.error('Error saving category and subcategory order:', error);
    }
}
</script>
<ErrorMessage error={error} />
<!-- Replace the existing table layout with a card-based layout -->
{#each Object.entries(services) as [category, serviceList]}
    <div class="p-4">
        {#if showInput === category}
            <input type="text" bind:value={newCategoryName} class="border p-2 rounded"/>
            <button on:click={() => changeCategoryName(category, newCategoryName)}>Opslaan</button>
        {:else}
            <h3 class="text-xl font-semibold mb-4 flex items-center">
                <span on:click={() => {showInput = category; newCategoryName = category;}}>{category}</span>
                <button on:click={() => moveCategoryUp(category)} class="ml-2">
                    ▲
                </button>
                <button on:click={() => moveCategoryDown(category)} class="ml-1">
                    ▼
                </button>
            </h3>
        {/if}
        
        <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subcategorie</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prijs</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                        <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acties</th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    {#each serviceList as service, index}
                        <tr class="hover:bg-gray-50"
                            draggable="true"
                            on:dragstart={(e) => handleDragStart(e, category, index)}
                            on:drop={(e) => handleDrop(e, category, index)}
                            on:dragover={handleDragOver}>
                            <td class="px-6 py-4 whitespace-nowrap">{service.subcategory}</td>
                            <td class="px-6 py-4 whitespace-nowrap">{service.type}</td>
                            <td class="px-6 py-4 whitespace-nowrap">€{service.price}</td>
                            <td class="px-6 py-4 whitespace-nowrap">{service.unit}</td>
                            <td class="px-6 py-4 whitespace-nowrap">{service.order}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-right">
                                <div class="flex justify-end gap-2">
                                    <button on:click={() => duplicateService(category, index)} 
                                        class="p-2 rounded-md border text-sm hover:bg-gray-100">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" />
                                        </svg>
                                    </button>
                                    <button on:click={() => editService(category, index, service)} 
                                        class="p-2 rounded-md border text-sm hover:bg-gray-100">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                                        </svg>
                                    </button>
                                    <button on:click={() => confirmDelete(category, index)} 
                                        class="p-2 rounded-md border text-sm hover:bg-gray-100">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                        </svg>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    </div>
{/each}

<!-- Update the edit dialog to be more mobile-friendly -->
{#if isEditDialogOpen}
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-lg shadow-lg w-full max-w-2xl">
            <div class="p-6 max-h-[90vh] overflow-y-auto scrollbar-hide">
                <h2 class="text-lg font-semibold mb-4">Bewerk dienst</h2>
                <div class="space-y-4">
                    <input type="text" placeholder="Subcategorie" 
                        bind:value={serviceToEdit.subcategory} 
                        class="w-full px-3 py-2 rounded-md border" />
                    <input type="text" placeholder="Type" 
                        bind:value={serviceToEdit.type} 
                        class="w-full px-3 py-2 rounded-md border" />
                    <input type="number" placeholder="Prijs" 
                        bind:value={serviceToEdit.price} 
                        class="w-full px-3 py-2 rounded-md border" />
                    <select bind:value={serviceToEdit.unit} 
                        class="w-full px-3 py-2 rounded-md border">
                        <option value="m¹">m¹</option>
                        <option value="m²">m²</option>
                        <option value="stuk">stuk</option>
                        <option value="uur">uur</option>
                    </select>
                    <CreateTasks bind:tasks={serviceToEdit.tasks} />

                    <input type="string" placeholder="Order" 
                        bind:value={serviceToEdit.order} 
                        class="w-full px-3 py-2 rounded-md border" />
                    
                    <div class="flex gap-2 justify-end mt-6">
                        <button on:click={() => isEditDialogOpen = false} 
                            class="px-4 py-2 rounded-md border text-sm">
                            Annuleer
                        </button>
                        <button on:click={saveEditedService} 
                            class="px-4 py-2 rounded-md border text-sm">
                            Opslaan
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
{/if}

<!-- Update the new category section -->
<div class="p-4">
    <div class="bg-white rounded-lg shadow p-4">
        <h2 class="text-lg font-semibold mb-4">Nieuwe categorie toevoegen</h2>
        <div class="flex gap-2">
            <input type="text" placeholder="Nieuwe categorie" 
                bind:value={newCategory} 
                class="flex-1 px-3 py-2 rounded-md border" />
            <button on:click={createNewCategory} 
                class="px-4 py-2 rounded-md border text-sm">
                Toevoegen
            </button>
        </div>
    </div>
</div>

<!-- Add the delete confirmation dialog -->
{#if showDeleteConfirmation}
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h2 class="text-lg font-semibold mb-4">Bevestig verwijderen</h2>
            <p class="mb-6">Weet je zeker dat je deze dienst wilt verwijderen?</p>
            <div class="flex justify-end gap-2">
                <button on:click={() => showDeleteConfirmation = false} 
                    class="px-4 py-2 rounded-md border text-sm">
                    Annuleer
                </button>
                <button on:click={deleteService} 
                    class="px-4 py-2 rounded-md bg-red-600 text-white text-sm hover:bg-red-700">
                    Verwijder
                </button>
            </div>
        </div>
    </div>
{/if}


