<script lang="ts">
  // import UserSearch from '../../userSearch.svelte';
  import { onMount } from 'svelte';
  import { Databases, Query } from "appwrite";
  import { client } from "$lib/appwrite";
  import { selectedUser } from "../../../../stores/userStore";
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import ImageUploader from '../../../../components/ImageUploader.svelte'; // Adjust the path as necessary
  import { Pencil } from 'lucide-svelte';
  import TermsComponent from '../../../terms/+page.svelte';
  import CreatePaymentSchedule from '../../../../components/createPaymentScedule.svelte';
  import type { Client, Task, Project, PaymentSchedule, UploadedImage, Terms, Service, Calculation, Item} from '$lib/types';
  
  let projectId = $page.params.id;
  const databases = new Databases(client);
  const databaseId = 'PriceCalc'; // Your database ID
  const itemsCollectionId = '6735eb1000013509eaf3'; // Your collection ID
  const projectsCollectionId = '67362a9400133ceb48ac'; // Your collection ID
  let services: Record<string, Service[]> = {};
  let uploadedImages: UploadedImage[] = [];
  let projects: Project[] = [];
  let newProjectName: string = ''; // Variable to hold the new project name
  let totalPrice: number = 0;
  let totalItems: number = 0;
  let opmerkingen: string = ''; // Add these variables
  let notities: string = '';    // Add these variables
  let terms: Terms[] = [];
  let paymentSchedule: PaymentSchedule;
  let openCategories: Record<string, boolean> = {};  // Add this near other let declarations
  

  $: console.log(projects)
  onMount(async () => {
    try {
        const response = await databases.listDocuments(databaseId, itemsCollectionId, [Query.limit(100),Query.offset(0)]);
        services = response.documents.reduce((acc: Record<string, Service[]>, doc) => {
            const { category, subcategory, type, price, unit, tasks } = doc;
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push({ 
                id: doc.$id,
                name: type,
                description: '',
                category,
                isEditing: false,
                subcategory, 
                type, 
                price, 
                unit, 
                tasks 
            });
            return acc;
        }, {});
        console.log(response)
    } catch (error) {
        console.error('Error fetching services:', error);
    }
    
    if (projectId === "new") {
      console.log("New project creation initiated.");
    } else {
      const databases = new Databases(client);
      const result = await databases.getDocument(databaseId, projectsCollectionId, projectId);
      result.items = JSON.parse(result.items);
      // selectedItems = result.items;
      $selectedUser = result.client;
      projects = JSON.parse(result.projects);
      opmerkingen = result.opmerkingen || ''; // Load saved values
      notities = result.notities || '';       // Load saved values

      // Push uploaded images to the array
      if (result.uploadedImages) {
        uploadedImages = result.uploadedImages.map((image: any) => JSON.parse(image));
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
    let calculations: Record<string, Calculation> = {};
  
    function toggleItemSelection(category: string, item: Service, project: Project) {
      console.log(project);
      const index = project.items.findIndex(
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
          quantity = calculations[category].length || 1;
        }
      }
      
      if (index === -1) {
        // Parse tasks from the tasks field if it exists
        let initialTasks = [];
        if (item.tasks) {
          try {
            const tasksArray = typeof item.tasks === 'string' ? JSON.parse(item.tasks) : item.tasks;
            initialTasks = tasksArray.map((task: Task) => ({
              description: task,
              completed: false
            }));
          } catch (error) {
            console.error('Error parsing tasks:', error);
            initialTasks = [];
          }
        }

        const newItem: Item = {
          category,
          ...item,
          quantity: quantity,
          tasks: initialTasks
        };
        project.items = [...(project.items || []), newItem];
      } else {
        project.items = project.items.filter((_, i) => i !== index);
      }
      projects = [...projects]; // Trigger reactivity
    }
  
    $: totalPrice = projects.reduce((projectSum, project) => {
      return projectSum + project.items.reduce((sum, item) => {
        const price = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
        return sum + (price * item.quantity);
      }, 0);
    }, 0);

    $: totalItems = projects.reduce((projectItemCount, project) => {
      return projectItemCount + project.items.reduce((count, item) => {
        return count + item.quantity;
      }, 0);
    }, 0);

    $: console.log(projects);

    async function saveProject() {
    try {
        // Flatten all items from all projects and include their tasks
        const allItems = projects.flatMap(project => 
            project.items.map(item => ({
                ...item,
                tasks: item.tasks || [] // Ensure tasks exists
            }))
        );

        const projectData: Partial<Project> = {
            items: JSON.stringify(allItems),
            projects: JSON.stringify(projects),
            totalPrice: totalPrice,
            client: $selectedUser.$id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            uploadedImages: uploadedImages.map(image => (JSON.stringify({ id: image.id, category: image.category }))),
            opmerkingen,
            notities,
            terms: JSON.stringify(terms.filter(term => term.checked)), // Only include checked terms
            paymentSchedule: JSON.stringify(paymentSchedule)
        };
        console.log(projectData);
        // Generate tasks from all items across all projects
        projectData.tasks = allItems.flatMap(item => {
            if (!item.tasks) return [];
            const tasksArray = typeof item.tasks === 'string' ? JSON.parse(item.tasks) : item.tasks;
            return tasksArray.map(task => ({
                category: item.category,
                subcategory: item.subcategory,
                type: item.type,
                completed: false,
                description: task.description,
                projectName: item.projectName // Include project name with each item
            }));
        });

        console.log(projectData);
        
        // Check if projectId is "new" to create a new document, otherwise update the existing one
        const response = projectId === "new"
            ? await databases.createDocument(databaseId, projectsCollectionId, 'unique()', projectData)
            : await databases.updateDocument(databaseId, projectsCollectionId, projectId, { ...projectData, updatedAt: new Date().toISOString() });
        
        console.log('Project saved successfully:', response);


        const pdf = await fetch('/api/generate-pdf', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(
              response
            )
        });

        console.log('pdf', pdf);

        goto('/project/view/' + response.$id);
    } catch (error) {
        console.error('Error saving project:', error);
    }
  }

  // Define a task structure
  let tasks: Task[] = [];

  // Function to create tasks from selected items
  // function createTasksFromInvoice() {
  //   tasks = selectedItems.map(item => ({
  //     id: `${item.category}-${item.subcategory}-${item.type}`,
  //     subcategory: item.subcategory,
  //     type: item.type,
  //     completed: false,
  //     photo: null
  //   }));
  // }

  // function toggleTaskCompletion(task: Task) {
  //   task.completed = !task.completed;
  // }

  // function handlePhotoUpload(event, task: Task) {
  //   const file = event.target.files[0];
  //   if (file) {
  //     task.photo = URL.createObjectURL(file);
  //   }
  // }

  function addProject() {
    if (newProjectName.trim()) {
      projects = [...projects, {name: newProjectName, items: []}]; // Add the new project name to the projects array
      newProjectName = ''; // Clear the input field after adding
    }
  }

  function removeProject(projectName: string) {
    projects = projects.filter(project => project.name !== projectName);
  }

  function clickOutside(node: HTMLElement, callback: () => void) {
    const handleClick = (event: MouseEvent) => {
      if (node && !node.contains(event.target as Node)) {
        callback();
      }
    };

    document.addEventListener('click', handleClick, true);

    return {
      destroy() {
        document.removeEventListener('click', handleClick, true);
      }
    };
  }

</script>
  
    <div class="flex flex-col md:flex-row">
      <div class="w-full md:w-1/2 border border-gray-300 rounded-md m-4 p-4">
        <h2 class="text-lg font-medium">Klantgegevens</h2>
        <div class="relative">
          <a href="/client/edit/{$selectedUser?.$id}"><Pencil class="absolute top-0 right-0 cursor-pointer" /></a>
          <div>
            <label for="name">Naam:</label>
            <span id="name">{$selectedUser?.name || 'N/A'}</span>
          </div>
          <div>
            <label for="lastname">Achternaam:</label>
            <span id="lastname">{$selectedUser?.lastname || 'N/A'}</span>
          </div>
          <div>
            <label for="adress">Adres:</label>
            <span id="adress">{$selectedUser?.adress || 'N/A'}</span>
          </div>
          <div>
            <label for="huisnummer">Huisnummer:</label>
            <span id="huisnummer">{$selectedUser?.huisnummer || 'N/A'}</span>
          </div>
          <div>
            <label for="postcode">Postcode:</label>
            <span id="postcode">{$selectedUser?.postcode || 'N/A'}</span>
          </div>
          <div>
            <label for="woonplaats">Stad:</label>
            <span id="woonplaats">{$selectedUser?.woonplaats || 'N/A'}</span>
          </div>
          <div>
            <label for="businessname">Bedrijfsnaam:</label>
            <span id="businessname">{$selectedUser?.businessname || 'N/A'}</span>
          </div>
          <div>
            <label for="email">Email:</label>
            <span id="email">{$selectedUser?.email || 'N/A'}</span>
          </div>
          <div>
            <label for="telefoonnummer">Telefoonnummer:</label>
            <span id="telefoonnummer">{$selectedUser?.telefoonnummer || 'N/A'}</span>
          </div>
        </div>
      </div>
      <div class="w-full md:w-1/2 m-4">
        <div class="border border-gray-300 rounded-md p-4">
          <h2 class="text-lg font-medium">Opmerkingen</h2>
          <textarea 
              class="w-full border rounded-md p-2" 
              rows="4" 
              bind:value={opmerkingen} 
              placeholder="Voer opmerkingen in..."
          ></textarea>
        </div>
        <div class="border border-gray-300 rounded-md p-4 mt-4">
          <h2 class="text-lg font-medium">Notities (geheim)</h2>
          <textarea 
              class="w-full border rounded-md p-2" 
              rows="4" 
              bind:value={notities} 
              placeholder="Voer notities in..."
          ></textarea>
        </div>
      </div>
    </div>

  <div class="w-full max-w-4xl mx-auto p-4 space-y-2 flex flex-col gap-4"> 
    <!-- <UserSearch /> -->
     {#each projects as project}
      <div class="border rounded-lg p-2 bg-gray-100">
        <div class="flex justify-between items-center p-2">
          <h1 class="text-lg font-medium">{project.name}</h1>
          <button class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded" on:click={() => removeProject(project.name)}>
            Verwijder
          </button>
        </div>
        <ImageUploader category={project.name} bind:uploadedImages={uploadedImages} on:upload={event => console.log('File uploaded:', event.detail.file)} />
        {#each Object.entries(services) as [category, items]}
      <div class="border rounded-lg bg-white">
        <button
          class="w-full p-4 flex items-center justify-between hover:bg-gray-50"
          on:click={() => openCategories[category] = !openCategories[category]}
        >
          <div class="flex items-center gap-3">
            <span class="font-medium">{category}</span>
          </div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5 transform transition-transform {openCategories[category] ? 'rotate-180' : ''}"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {#if openCategories[category] || items.some((item: Item) => project.items.some((selected: Item) => selected.category === category && selected.subcategory === item.subcategory && selected.type === item.type))}
          <div class="p-4 pt-0 space-y-4">
            {#each items as item}
              <div class="space-y-2">
                <div 
                  class="flex justify-between p-2 border rounded-md cursor-pointer hover:bg-gray-50 {project.items.some((i: Item) => i.category === category && i.subcategory === item.subcategory && i.type === item.type) ? 'bg-blue-50 border-blue-200' : ''}"
                >
                  <div
                    class="flex-grow"
                    on:click={() => item.price !== 'custom' && toggleItemSelection(category, item, project)}
                  >
                    <span class="font-medium">{item.subcategory}</span>
                    <span class="text-gray-600 ml-2">{item.type}</span>
                  </div>
                  <span>
                    {#if item.price === "custom"}
                      <input 
                        type="number"
                        bind:value={item.price}
                        class="w-32 p-1 border rounded-md text-right"
                        on:blur={() => item.isEditing = false}
                        use:clickOutside={() => item.isEditing = false}
                      />
                    {:else}
                      {#if item.isEditing}
                        <input 
                          type="number"
                          bind:value={item.price}
                          class="w-32 p-1 border rounded-md text-right"
                          on:blur={() => item.isEditing = false}
                          use:clickOutside={() => item.isEditing = false}
                          on:keydown={(event) => event.key === 'Enter' && (item.isEditing = false)}
                        />
                      {:else}
                        <div on:click|stopPropagation={() => item.isEditing = true}>
                          €{item.price}{#if item.unit !== "custom"}/{item.unit}{/if}
                        </div>
                      {/if}
                    {/if}
                  </span>
                </div>

                <!-- Add tasks section here -->
                {#if project.items.some((i: Item) => i.category === category && i.subcategory === item.subcategory && i.type === item.type)}
                  <div class="ml-4 p-2 bg-gray-50 rounded-md">
                    <h4 class="font-medium text-sm mb-2">Taken:</h4>
                    {#each project.items.find((i: Item) => i.category === category && i.subcategory === item.subcategory && i.type === item.type).tasks || [] as task, taskIndex}
                      <div class="flex items-center gap-2 mb-2">
                        
                        <input
                          type="text"
                          bind:value={task.description}
                          class="flex-1 p-1 text-sm border rounded"
                        />
                        <button
                          class="text-red-500 hover:text-red-700 px-2"
                          on:click={() => {
                            const itemIndex = project.items.findIndex((i: Item) => 
                              i.category === category && 
                              i.subcategory === item.subcategory && 
                              i.type === item.type
                            );
                            project.items[itemIndex].tasks.splice(taskIndex, 1);
                            projects = [...projects];
                          }}
                        >
                          ×
                        </button>
                      </div>
                    {/each}
                    <button
                      class="text-sm text-blue-500 hover:text-blue-700"
                      on:click={() => {
                        const itemIndex = project.items.findIndex((i: Item) => 
                          i.category === category && 
                          i.subcategory === item.subcategory && 
                          i.type === item.type
                        );
                        if (!project.items[itemIndex].tasks) {
                          project.items[itemIndex].tasks = [];
                        }
                        project.items[itemIndex].tasks.push({ description: '', completed: false });
                        projects = [...projects];
                      }}
                    >
                      + Nieuwe taak
                    </button>
                  </div>
                {/if}
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
                      <label for="length-input" class="block text-sm text-gray-600">Lengte (m)</label>
                      <input 
                        id="length-input"
                        type="number" 
                        value={calculations[category]?.length || 1}
                        on:input={(event) => {
                          calculations[category] = calculations[category] || {};
                          calculations[category].length = parseFloat((event.target as HTMLInputElement).value);
                          // Update quantities for selected items in this category
                          project.items = project.items.map((item: Item) => {
                            if (item.category === category) {
                              return {
                                ...item,
                                quantity: (calculations[category].length || 1) * (calculations[category].width || 1)
                              };
                            }
                            return item;
                          });
                        }}
                        class="w-full p-2 border rounded-md"
                      />
                    </div>
                    <div>
                      <label for="width-input" class="block text-sm text-gray-600">Breedte (m)</label>
                      <input 
                        id="width-input"
                        type="number" 
                        value={calculations[category]?.width || 1}
                        on:input={(event) => {
                          calculations[category] = calculations[category] || {};
                          calculations[category].width = parseFloat((event.target as HTMLInputElement).value);
                          // Update quantities for selected items in this category
                          project.items = project.items.map((item: any) => {
                            if (item.category === category) {
                              return {
                                ...item,
                                quantity: (calculations[category].length || 1) * (calculations[category].width || 1)
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
                    <label for="length-input" class="block text-sm text-gray-600">Lengte (m)</label>
                    <input 
                      id="length-input"
                      type="number" 
                      value={calculations[category]?.length || 1}
                      on:input={(event) => {
                        calculations[category] = calculations[category] || {};
                        calculations[category].length = parseFloat((event.target as HTMLInputElement).value);
                        // Update quantities for selected items in this category
                        project.items = project.items.map((item: any) => {
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
                {/if}
              </div>
            {:else}
              <div class="space-y-3">
                <h3 class="font-medium">Aantal:</h3>
                <div>
                  <label for="quantity-input" class="block text-sm text-gray-600">Aantal stuks</label>
                  <input 
                    id="quantity-input"
                    type="number" 
                    value={calculations[category]?.length || 1}
                    min="1"
                    on:input={(event) => {
                      calculations[category] = calculations[category] || {};
                      calculations[category].length = parseFloat((event.target as HTMLInputElement).value);
                      // Update quantities for selected items in this category
                      project.items = project.items.map((item: any) => {
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
    </div>

    
    
    {/each}

  
    <input 
      type="text" 
      bind:value={newProjectName} 
      placeholder="Vul daknaam in" 
      class="mt-2 p-2 border rounded-md"
      on:keypress={(event) => event.key === 'Enter' && addProject()}
    />
   
    <button class="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" on:click={addProject}>
      Voeg dak toe
    </button>

    <TermsComponent bind:terms={terms} bind:projects={projects} />

    <CreatePaymentSchedule bind:totalPrice={totalPrice} bind:paymentSchedule={paymentSchedule} />

    {#if projects.length > 0 || uploadedImages.length > 0}
      <div 
        class="fixed bottom-4 right-4 bg-white shadow-lg rounded-lg p-4 border"
        role="button"
        tabindex="0"
        on:click={() => showInvoice = !showInvoice}
        on:keydown={e => e.key === 'Enter' && (showInvoice = !showInvoice)}
      >
        <div>
          <div class="text-lg font-medium">Totaal: €{totalPrice.toFixed(2)}</div>
          <div class="text-sm text-gray-600">{totalItems} item{totalItems === 1 ? '' : 's'} geselecteerd</div>
        </div>
        {#if showInvoice}
          <div class="mt-4">
            {#each projects as project}
              <h2 class="text-lg font-medium">{project.name}</h2>
              {#each project.items as item, index}
                <div class="flex justify-between items-center mt-2">
                  <div>{item.subcategory} - {item.type}</div>
                <div>{item.quantity} x €{item.price}</div>
              </div>
            {/each}
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
    <div class="text-lg font-medium text-white">Selecteer eerst een klant</div>
  </div>
{/if}
