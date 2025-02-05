<script>
import { onMount } from 'svelte';
import { Databases, ID, Query } from "appwrite";
import { client } from "$lib/appwrite";
import CreateTasks from '../../components/createTasks.svelte';

const databases = new Databases(client);
const databaseId = 'PriceCalc'; // Your database ID
const collectionId = '6735eb1000013509eaf3'; // Your collection ID

let services = {};

// New reactive variable for selected category
let selectedCategory = ''; // Initialize selectedCategory

// New reactive variable for the edit dialog
let isEditDialogOpen = false; // Manage dialog visibility
let serviceToEdit = null; // Store the service being edited

// New reactive variable to track visibility of taken for each service
let tasksVisibility = {};

onMount(async () => {
    try {
        const response = await databases.listDocuments(databaseId, collectionId, [Query.limit(100),Query.offset(0)]);
        console.log(response)
        services = response.documents.reduce((acc, doc) => {
            const { category, subcategory, type, price, unit, $id, tasks } = doc;
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push({ subcategory, type, price, unit, $id, tasks});
            return acc;
        }, {});
        console.log(services)
    } catch (error) {
        console.error('Error fetching services:', error);
    }
});

// New variables for the editor
let newService = {
    subcategory: '',
    type: '',
    price: '',
    unit: '',
    tasks: ''
};

function addService(category) {
    if (newService.subcategory && newService.type && newService.price && newService.unit) {
        services[category].push({ ...newService });
        resetNewService();
    }
}

function resetNewService() {
    newService = {
        subcategory: '',
        type: '',
        price: '',
        unit: '',
        tasks: ''
    };
}

// Function to update an existing service
function updateService(category, index, updatedService) {
    services[category][index] = updatedService;
}

// Function to delete a service
async function deleteService(category, index) {
    console.log(category, index);
   try {
        const response = await databases.deleteDocument(databaseId, collectionId, services[category][index].$id);
        console.log('Service deleted successfully:', response);
    } catch (error) {
        console.error('Error deleting service:', error);
    }
    services[category].splice(index, 1);
    services = services;
 
  }

// Function to open the edit dialog
function editService(category, index, service) {
    serviceToEdit = { ...service, category, index }; // Store the service details
    isEditDialogOpen = true; // Open the dialog
}

// Function to save the edited service
async function saveEditedService() {
    if (serviceToEdit) {
        if (serviceToEdit.$id) {
            updateService(serviceToEdit.category, serviceToEdit.index, serviceToEdit);
            isEditDialogOpen = false; // Close the dialog
            resetNewService(); // Reset new service fields if needed
            try {
                const response = await databases.updateDocument(databaseId, collectionId, serviceToEdit.$id, {
                    subcategory: serviceToEdit.subcategory,
                    type: serviceToEdit.type,
                    price: parseInt(serviceToEdit.price),
                    unit: serviceToEdit.unit,
                    category: serviceToEdit.category, // Optionally include the category
                    tasks: serviceToEdit.tasks // Include taken
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
                    tasks: serviceToEdit.tasks // Include taken
                });
                console.log('Service created successfully:', response);
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

</script>
<!-- Replace the existing table layout with a card-based layout -->
{#each Object.entries(services) as [category, serviceList]}
    <div class="p-4">
        <h3 class="text-xl font-semibold mb-4">{category}</h3>
        <div class="grid gap-4">
            {#each serviceList as service, index}
                <div class="bg-white rounded-lg shadow p-4">
                    <div class="space-y-2">
                        <div class="flex justify-between items-center">
                            <span class="font-medium">{service.subcategory}</span>
                            <div class="flex gap-2">
                                <button on:click={() => editService(category, index, service)} 
                                    class="p-2 rounded-md border text-sm hover:bg-gray-100">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                                    </svg>
                                </button>
                                <button on:click={() => deleteService(category, index)} 
                                    class="p-2 rounded-md border text-sm hover:bg-gray-100">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                    </svg>
                                </button>
                                <button on:click={() => toggletasksVisibility(category, index)} 
                                    class="p-2 rounded-md border text-sm hover:bg-gray-100">
                                    {#if tasksVisibility[`${category}-${index}`]}
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                                        </svg>
                                    {:else}
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                        </svg>
                                    {/if}
                                </button>
                            </div>
                        </div>
                        <div class="grid grid-cols-2 gap-2 text-sm">
                            <div>Type: {service.type}</div>
                            <div>Prijs: {service.price}</div>
                            <div>Unit: {service.unit}</div>
                        </div>
                        {#if tasksVisibility[`${category}-${index}`]}
                            <div class="mt-2 text-sm text-gray-600">
                                <div class="font-medium">Taken:</div>
                                {#each JSON.parse(service.tasks) as part}
                                    <div class="ml-2">- {part}</div>
                                {/each}
                            </div>
                        {/if}
                    </div>
                </div>
            {/each}
            <button on:click={() => editService(category, serviceList.length, {})} 
                class="w-full px-4 py-2 rounded-md border text-sm hover:bg-gray-100 flex items-center justify-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                <span>Add New Service</span>
            </button>
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
                    <CreateTasks tasks={JSON.parse(serviceToEdit.tasks || '[]')} />
                    
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


