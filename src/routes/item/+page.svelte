<script>
import { onMount } from 'svelte';
import { Databases, ID, Query } from "appwrite";
import { client } from "$lib/appwrite";

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
let takenVisibility = {};

onMount(async () => {
    try {
        const response = await databases.listDocuments(databaseId, collectionId, [Query.limit(100),Query.offset(0)]);
        console.log(response)
        services = response.documents.reduce((acc, doc) => {
            const { category, subcategory, type, price, unit, $id, taken } = doc;
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push({ subcategory, type, price, unit, $id, taken});
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
    taken: ''
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
        taken: ''
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
                    taken: serviceToEdit.taken // Include taken
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
                    taken: serviceToEdit.taken // Include taken
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

function toggletakenVisibility(category, index) {
    const key = `${category}-${index}`;
    takenVisibility[key] = !takenVisibility[key];
}

</script>
<!-- Display existing services in a table with an edit button and Tailwind styling -->
{#each Object.entries(services) as [category, serviceList]}
    <h3 class="text-xl font-semibold mb-4">{category}</h3>
    <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
            <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subcategory</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prijs</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Edit</th>
            </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
            {#each serviceList as service, index}
                <tr>
                    <td class="px-6 py-4 whitespace-nowrap">{service.subcategory}</td>
                    <td class="px-6 py-4 whitespace-nowrap">{service.type}</td>
                    <td class="px-6 py-4 whitespace-nowrap">{service.price}</td>
                    <td class="px-6 py-4 whitespace-nowrap">{service.unit}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button on:click={() => editService(category, index, service)} class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Edit</button>
                        <button on:click={() => deleteService(category, index)} class="ml-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Delete</button>
                        <button on:click={() => toggletakenVisibility(category, index)} class="ml-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                            {takenVisibility[`${category}-${index}`] ? 'Verberg' : 'Toon'} taken
                        </button>
                    </td>
                </tr>
                {#if takenVisibility[`${category}-${index}`]}
                    <tr>
                        <td colspan="5" class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            taken:
                            {#each service.taken.split('*') as part}
                                <div>- {part}</div>
                            {/each}
                        </td>
                    </tr>
                {/if}
            {/each}
            <tr>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium"><button on:click={() => editService(category, serviceList.length, {})} class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">+</button></td>
            </tr>
        </tbody>
    </table>
{/each}

<!-- Dialog for editing a service -->
{#if isEditDialogOpen}
    <div class="fixed inset-0 flex items-center justify-center z-50">
        <div class="bg-white p-6 rounded-lg shadow-lg">
            <h2 class="text-lg font-semibold mb-4">Edit Service</h2>
            <input type="text" placeholder="Subcategory" bind:value={serviceToEdit.subcategory} class="form-input block w-full mt-1 mb-4" />
            <input type="text" placeholder="Type" bind:value={serviceToEdit.type} class="form-input block w-full mt-1 mb-4" />
            <input type="number" placeholder="Prijs" bind:value={serviceToEdit.price} class="form-input block w-full mt-1 mb-4" />
            <select bind:value={serviceToEdit.unit} class="form-select block w-full mt-1 mb-4">
                <option value="m¹">m¹</option>
                <option value="m²">m²</option>
                <option value="stuk">stuk</option>
                <option value="uur">uur</option>
            </select>
            <textarea placeholder="taken" bind:value={serviceToEdit.taken} class="form-input block w-full mt-1 mb-4" />
            <button on:click={saveEditedService} class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Save Changes</button>
            <button on:click={() => isEditDialogOpen = false} class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-gray-600 bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">Cancel</button>
        </div>
    </div>
{/if}



<!-- New HTML for the editor with Tailwind styling -->
<div class="p-4 bg-white shadow rounded-lg">
    <h2 class="text-lg font-semibold mb-4">Nieuwe categorie toevoegen</h2>
    <div class="flex gap-4">
        <input type="text" placeholder="Enter new category" bind:value={newCategory} class="form-input block w-full mt-1 mb-4 rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-500 focus:ring-opacity-50" />
        <button on:click={createNewCategory} class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Create</button>
    </div>
</div>


