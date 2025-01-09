<script lang="ts">
  // import UserSearch from '../../userSearch.svelte';
  import { onMount } from 'svelte';
  import { Databases, Query } from "appwrite";
  import { client } from "$lib/appwrite";
  import { selectedUser } from "../../../../stores/userStore";
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import ImageUploader from '../../../../components/ImageUploader.svelte'; // Adjust the path as necessary

  let projectId = $page.params.id;
  const databases = new Databases(client);
  const databaseId = 'PriceCalc'; // Your database ID
  const itemsCollectionId = '6735eb1000013509eaf3'; // Your collection ID
  const projectsCollectionId = '67362a9400133ceb48ac'; // Your collection ID
  let services = {};
  let uploadedImages: any[] = []; // Declare uploadedImages as an array

  onMount(async () => {
    try {
        const response = await databases.listDocuments(databaseId, itemsCollectionId, [Query.limit(100),Query.offset(0)]);
        services = response.documents.reduce((acc, doc) => {
            const { category, subcategory, type, price, unit, taken } = doc;
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push({ subcategory, type, price, unit, taken });
            return acc;
        }, {});
    } catch (error) {
        console.error('Error fetching services:', error);
    }
    
    if (projectId === "new") {
      console.log("New project creation initiated.");
    } else {
      const databases = new Databases(client);
      const result = await databases.getDocument(databaseId, projectsCollectionId, projectId);
      result.items = JSON.parse(result.items);
      selectedItems = result.items;
      $selectedUser = result.client;

      // Push uploaded images to the array
      if (result.uploadedImages) {
        uploadedImages = result.uploadedImages.map(image => JSON.parse(image));
      }
    }
  });

  let showInvoice = false;

    let selectedType: string | null = null;
    let length: number = 0;
    let width: number = 0;
  
    interface SelectedItem {
      category: string;
      subcategory: string;
      type: string;
      price: string | number;
      unit: string;
      quantity: number;
      tasks: Task[];
    }
  
    let selectedItems: SelectedItem[] = [];
  
    // Add these variables for calculations
    let calculations: Record<string, { length?: number; width?: number }> = {};
  
    function toggleItemSelection(category: string, item: any) {
      const index = selectedItems.findIndex(
        i => i.category === category && i.subcategory === item.subcategory && i.type === item.type
      );
      
      // Calculate quantity based on measurements or amount
      let quantity = 1;
      if (calculations[category]) {
        if (item.unit === "m²") {
          quantity = (calculations[category].length || 0) * (calculations[category].width || 0);
        } else if (item.unit === "m¹") {
          quantity = calculations[category].length || 0;
        } else {
          quantity = calculations[category].length || 1; // For items with amount
        }
      }
      
      if (index === -1) {
        selectedItems = [...selectedItems, {
          category,
          ...item,
          quantity: quantity,
          tasks: []
        }];
      } else {
        selectedItems = selectedItems.filter((_, i) => i !== index);
      }
    }
  
    $: totalPrice = selectedItems.reduce((sum, item) => {
      const price = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
      return sum + (price * item.quantity);
    }, 0);

  
    async function saveProject() {
    console.log(selectedItems);
    try {
        const projectData = {
            items: JSON.stringify(selectedItems.map(item => ({
              ...item,
              tasks: item.tasks.map(task => ({ id: task.id, completed: task.completed }))
            }))),
            totalPrice: totalPrice,
            client: $selectedUser.$id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            uploadedImages: uploadedImages.map(image => (JSON.stringify({ id: image.id, category: image.category }))), // Only upload file ID and category
            // Add any other relevant project data here
        };

        // Process item.taken and add tasks to projectData
        projectData.tasks = selectedItems.flatMap(item => {
            return item.taken.split('*').map(task => ({
                // id: `${item.category}-${item.subcategory}-${item.type}-${task.trim()}`,
                category: item.category,
                subcategory: item.subcategory,
                type: item.type,
                completed: false,
                description: task.trim()
            }));
        });

        console.log(projectData);
        
        // Check if projectId is "new" to create a new document, otherwise update the existing one
        const response = projectId === "new"
            ? await databases.createDocument(databaseId, projectsCollectionId, 'unique()', projectData)
            : await databases.updateDocument(databaseId, projectsCollectionId, projectId, { ...projectData, updatedAt: new Date().toISOString() });
        
        console.log('Project saved successfully:', response);
        goto('/project/view/' + response.$id);
    } catch (error) {
        console.error('Error saving project:', error);
    }
  }

  // Define a task structure
  interface Task {
    id: string;
    subcategory: string;
    type: string;
    completed: boolean;
    photo: string | null;
  }

  let tasks: Task[] = [];

  // Function to create tasks from selected items
  function createTasksFromInvoice() {
    tasks = selectedItems.map(item => ({
      id: `${item.category}-${item.subcategory}-${item.type}`,
      subcategory: item.subcategory,
      type: item.type,
      completed: false,
      photo: null
    }));
  }

  function toggleTaskCompletion(task: Task) {
    task.completed = !task.completed;
  }

  function handlePhotoUpload(event, task: Task) {
    const file = event.target.files[0];
    if (file) {
      task.photo = URL.createObjectURL(file);
    }
  }


  </script>
  
  <div class="flex justify-between">
    <div class="w-1/2 border border-gray-300 rounded-md m-4 p-4">
      <h2 class="text-lg font-medium">Klantgegevens</h2>
      <div>
        <label>Naam:</label>
        <span>{client?.name || 'N/A'}</span>
      </div>
      <div>
        <label>Achternaam:</label>
        <span>{client?.lastname || 'N/A'}</span>
      </div>
      <div>
        <label>Adres:</label>
        <span>{client?.address || 'N/A'}</span>
      </div>
      <div>
        <label>Huisnummer:</label>
        <span>{client?.houseNumber || 'N/A'}</span>
      </div>
      <div>
        <label>Postcode:</label>
        <span>{client?.postalCode || 'N/A'}</span>
      </div>
      <div>
        <label>Stad:</label>
        <span>{client?.city || 'N/A'}</span>
      </div>
    </div>
    <div class="w-1/2 m-4 ">
      <ImageUploader category="vooraf" bind:uploadedImages={uploadedImages} on:upload={event => console.log('File uploaded:', event.detail.file)} />
    </div>
  </div>

  <div class="w-full max-w-4xl mx-auto p-4 space-y-2 flex flex-col gap-4"> 
    <!-- <UserSearch /> -->
    {#each Object.entries(services) as [category, items]}
      <div class="border rounded-lg">
        <button
          class="w-full p-4 flex items-center justify-between hover:bg-gray-50"
          on:click={() => items.isOpen = !items.isOpen}
        >
          <div class="flex items-center gap-3">
            <span class="font-medium">{category}</span>
          </div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5 transform transition-transform {items.isOpen ? 'rotate-180' : ''}"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {#if items.isOpen || items.some(item => selectedItems.some(selected => selected.category === category && selected.subcategory === item.subcategory && selected.type === item.type))}
          <div class="p-4 pt-0 space-y-4">
            {#each items as item}
              <div 
                class="flex justify-between p-2 border rounded-md cursor-pointer hover:bg-gray-50 {selectedItems.some(i => i.category === category && i.subcategory === item.subcategory && i.type === item.type) ? 'bg-blue-50 border-blue-200' : ''}"
                on:click={() => item.price !== 'custom' && toggleItemSelection(category, item)}
              >
                <div>
                  <span class="font-medium">{item.subcategory}</span>
                  <span class="text-gray-600 ml-2">{item.type}</span>
                </div>
                <span>
                  {#if item.price === "custom"}
                    <input 
                      type="number"
                      placeholder="Vul prijs in"
                      class="w-32 p-1 border rounded-md text-right"
                    />
                  {:else}
                    €{item.price}{#if item.unit !== "custom"}/{item.unit}{/if}
                  {/if}
                </span>
              </div>
            {/each}
  
            {#if items[0].unit === "m²" || items[0].unit === "m¹"}
              <div class="space-y-3">
                <h3 class="font-medium">
                  {items[0].unit === "m²" ? "Oppervlakte" : "Lengte"} berekenen:
                </h3>
                {#if items[0].unit === "m²"}
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm text-gray-600">Lengte (m)</label>
                      <input 
                        type="number" 
                        value={calculations[category]?.length || 0}
                        on:input={(event) => {
                          calculations[category] = calculations[category] || {};
                          calculations[category].length = parseFloat(event.target.value);
                          // Update quantities for selected items in this category
                          selectedItems = selectedItems.map(item => {
                            if (item.category === category) {
                              return {
                                ...item,
                                quantity: (calculations[category].length || 0) * (calculations[category].width || 0)
                              };
                            }
                            return item;
                          });
                        }}
                        class="w-full p-2 border rounded-md"
                      />
                    </div>
                    <div>
                      <label class="block text-sm text-gray-600">Breedte (m)</label>
                      <input 
                        type="number" 
                        value={calculations[category]?.width || 0}
                        on:input={(event) => {
                          calculations[category] = calculations[category] || {};
                          calculations[category].width = parseFloat(event.target.value);
                          // Update quantities for selected items in this category
                          selectedItems = selectedItems.map(item => {
                            if (item.category === category) {
                              return {
                                ...item,
                                quantity: (calculations[category].length || 0) * (calculations[category].width || 0)
                              };
                            }
                            return item;
                          });
                        }}
                        class="w-full p-2 border rounded-md"
                      />
                    </div>
                  </div>
                {:else}
                  <div>
                    <label class="block text-sm text-gray-600">Lengte (m)</label>
                    <input 
                      type="number" 
                      value={calculations[category]?.length || 0}
                      on:input={(event) => {
                        calculations[category] = calculations[category] || {};
                        calculations[category].length = parseFloat(event.target.value);
                        // Update quantities for selected items in this category
                        selectedItems = selectedItems.map(item => {
                          if (item.category === category) {
                            return {
                              ...item,
                              quantity: calculations[category].length || 0
                            };
                          }
                          return item;
                        });
                      }}
                      class="w-full p-2 border rounded-md"
                    />
                  </div>
                {/if}
              </div>
            {:else}
              <div class="space-y-3">
                <h3 class="font-medium">Aantal:</h3>
                <div>
                  <label class="block text-sm text-gray-600">Aantal stuks</label>
                  <input 
                    type="number" 
                    value={calculations[category]?.length || 1}
                    min="1"
                    on:input={(event) => {
                      calculations[category] = calculations[category] || {};
                      calculations[category].length = parseFloat(event.target.value);
                      // Update quantities for selected items in this category
                      selectedItems = selectedItems.map(item => {
                        if (item.category === category) {
                          return {
                            ...item,
                            quantity: calculations[category].length || 1
                          };
                        }
                        return item;
                      });
                    }}
                    class="w-full p-2 border rounded-md"
                  />
                </div>
              </div>
            {/if}
          </div>
        {/if}
      </div>
    {/each}
  
    {#if selectedItems.length > 0}
      <div class="fixed bottom-4 right-4 bg-white shadow-lg rounded-lg p-4 border">
        <div on:click={() => showInvoice = !showInvoice}>
          <div class="text-lg font-medium">Totaal: €{totalPrice.toFixed(2)}</div>
          <div class="text-sm text-gray-600">{selectedItems.length} item{selectedItems.length === 1 ? '' : 's'} geselecteerd</div>
        </div>
        {#if showInvoice}
          <div class="mt-4">
            {#each selectedItems as item, index}
              <div class="flex justify-between items-center mt-2">
                <div>{item.subcategory} - {item.type}</div>
                <div>{item.quantity} x €{item.price}</div>
              </div>
            {/each}
            <button class="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" on:click={saveProject}>
              Opslaan
            </button>
            <button class="mt-4 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded" on:click={saveProject}>
              Opslaan & Inplannen
            </button>
          </div>
        {/if}
      </div>
    {/if}
  </div>
  

  <style>
    /* Add your styles here */
  </style>
  
{#if !$selectedUser}
  <div class="absolute inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-20">
    <div class="text-lg font-medium text-white">Please select a user</div>
  </div>
{/if}
