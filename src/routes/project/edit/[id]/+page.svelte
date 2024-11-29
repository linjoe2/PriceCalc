<script lang="ts">
  // import UserSearch from '../../userSearch.svelte';
  import { onMount } from 'svelte';
  import { Databases, Query } from "appwrite";
  import { client } from "$lib/appwrite";

  const databases = new Databases(client);
  const databaseId = 'PriceCalc'; // Your database ID
  const collectionId = '6735eb1000013509eaf3'; // Your collection ID

  let services = {};

  onMount(async () => {
    try {
        const response = await databases.listDocuments(databaseId, collectionId, [Query.limit(100),Query.offset(0)]);
        console.log(response)
        services = response.documents.reduce((acc, doc) => {
            const { category, subcategory, type, price, unit } = doc;
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push({ subcategory, type, price, unit });
            return acc;
        }, {});
    } catch (error) {
        console.error('Error fetching services:', error);
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
          quantity: quantity
        }];
      } else {
        selectedItems = selectedItems.filter((_, i) => i !== index);
      }
    }
  
    $: totalPrice = selectedItems.reduce((sum, item) => {
      const price = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
      return sum + (price * item.quantity);
    }, 0);
  
    // Add this for managing uploaded images
    interface UploadedImage {
      file: File;
      preview: string;
    }
    
    let uploadedImages: Record<string, UploadedImage[]> = {};
  
    function handleFileUpload(event: Event, category: string) {
      const input = event.target as HTMLInputElement;
      const files = input.files;
      
      if (!files) return;
      
      // Initialize the category array if it doesn't exist
      if (!uploadedImages[category]) {
        uploadedImages[category] = [];
      }
      
      // Create preview URLs for each file
      Array.from(files).forEach(file => {
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (e) => {
            uploadedImages[category] = [...(uploadedImages[category] || []), {
              file,
              preview: e.target?.result as string
            }];
          };
          reader.readAsDataURL(file);
        }
      });
    }
  
    function removeImage(category: string, index: number) {
      uploadedImages[category] = uploadedImages[category].filter((_, i) => i !== index);
    }
  
    async function saveProject() {
      try {
        const projectData = {
          items: selectedItems,
          totalPrice: totalPrice,
          // Add any other relevant project data here
        };
        
        // Assuming you have a method to create a document in your projects database
        const response = await databases.createDocument(databaseId, 'projectsCollectionId', 'unique()', projectData);
        console.log('Project saved successfully:', response);
      } catch (error) {
        console.error('Error saving project:', error);
      }
    }
  </script>
  
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
        
        {#if items.isOpen}
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
  
            <div class="space-y-3">
              <h3 class="font-medium">Foto's uploaden:</h3>
              <div class="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <div class="text-center">
                  <label for="fileUpload-{category}" class="cursor-pointer">
                    <svg xmlns="http://www.w3.org/2000/svg" class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p class="mt-1 text-sm text-gray-600">Klik om foto's te uploaden</p>
                    <p class="mt-1 text-xs text-gray-500">PNG, JPG tot 10MB</p>
                  </label>
                  <input 
                    id="fileUpload-{category}"
                    type="file"
                    multiple
                    accept="image/*"
                    class="hidden"
                    on:change={(e) => handleFileUpload(e, category)}
                  />
                </div>
  
                {#if uploadedImages[category]?.length > 0}
                  <div class="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {#each uploadedImages[category] as image, index}
                      <div class="relative group">
                        <img 
                          src={image.preview} 
                          alt="Preview" 
                          class="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          class="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          on:click={() => removeImage(category, index)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    {/each}
                  </div>
                {/if}
              </div>
            </div>
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
          </div>
        {/if}
      </div>
    {/if}
  </div>
  

