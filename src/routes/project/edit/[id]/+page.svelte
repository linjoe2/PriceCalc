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
  import { Recycle } from 'lucide-svelte';
  import TermsComponent from '../../../terms/+page.svelte';
  import SearchAdress from '../../../../components/searchAdress.svelte';
  import CreatePaymentSchedule from '../../../../components/createPaymentScedule.svelte';
  import type { Client, Task, Project, PaymentSchedule, UploadedImage, Terms, Service, Calculation, Item} from '$lib/types';
  import SavingAnimation from "../../../../components/savingAnimation.svelte";
  import ProjectTask from '../../../../components/ProjectTask.svelte';
  import ClientSearch from '../../../../components/ClientSearch.svelte';
  let isSaving = false;
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
  let isUploading = false; // Add this near other let declarations at the top
  let calculations: Record<string, Calculation> = {};
  let projectNumber: string = '';
  let adress = null;
  let adressString = '';
  let name = '';
  let phone = '';
  let email = '';

  onMount(async () => {
    try {
        const response = await databases.listDocuments(databaseId, itemsCollectionId, [Query.limit(100),Query.offset(0)]);
        services = response.documents.reduce((acc: Record<string, Service[]>, doc) => {
            const { category, subcategory, type, price, unit, tasks } = doc;
            if (!acc[category]) {
                acc[category] = [];
                // Initialize calculations for this category
                calculations[category] = {
                    length: 1,
                    width: 1
                };
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

        if (projectId === "new") {
            console.log("New project creation initiated.");
            // Fetch all projects to determine the next project number
            const projectsResponse = await databases.listDocuments(
                databaseId, 
                projectsCollectionId,
                [Query.orderDesc('projectNumber'), Query.limit(1)]
            );
            
            const currentYear = new Date().getFullYear();
            let counter = 1;
            
            if (projectsResponse.documents.length > 0) {
                const lastProject = projectsResponse.documents[0];
                const lastProjectNumber = lastProject.projectNumber || '';
                if (lastProjectNumber.startsWith(currentYear.toString())) {
                    counter = parseInt(lastProjectNumber.slice(4)) + 1;
                }
            }
            
            // Format: YYYY001, YYYY002, etc.
            projectNumber = `${currentYear}${counter.toString().padStart(3, '0')}`;
        } else {
            const result = await databases.getDocument(databaseId, projectsCollectionId, projectId);
            result.items = JSON.parse(result.items);
            // selectedItems = result.items;
            $selectedUser = result.client;
            projects = JSON.parse(result.projects);
            opmerkingen = result.opmerkingen || ''; // Load saved values
            notities = result.notities || '';       // Load saved values
            name = result.name || '';
            phone = result.phone || '';
            email = result.email || '';
            adressString = result.adress || '';
            //result.items[].price = result.items[].price;
            console.log(result.items);
            // each item in result.items
            result.items.forEach(item => {
              item.price = item.price;
              console.log(item.category);
              services[item.category].forEach(service => {
                if (service.type === item.type) {
                  service.price = item.price;
                }
              });
            });
            // Load saved calculations or initialize with defaults
            if (result.calculations) {
              const savedCalculations = JSON.parse(result.calculations);
              // Merge saved calculations with defaults
              Object.keys(services).forEach(category => {
                  calculations[category] = {
                      length: (savedCalculations[category]?.length ?? 1),
                      width: (savedCalculations[category]?.width ?? 1)
                  };
              });
            }

            // Push uploaded images to the array
            if (result.uploadedImages) {
              uploadedImages = result.uploadedImages.map((image: any) => JSON.parse(image));
            }

            projectNumber = result.projectNumber || '';
        }
    } catch (error) {
        console.error('Error:', error);
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
          price: typeof item.price === 'string' && item.price !== 'custom' ? parseFloat(item.price) : item.price,
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
        if (isUploading) {
            alert('Please wait for images to finish uploading before saving');
            return;
        }
        isSaving = true;
    try {
        // Flatten all items from all projects and include their tasks
        const allItems = projects.flatMap(project => 
            project.items.map(item => ({
                ...item,
                tasks: item.tasks || [], // Ensure tasks exists
                calculations: calculations[item.category] || {} // Add calculations for this category
            }))
        );

        const projectData: Partial<Project> = {
            projectNumber,
            items: JSON.stringify(allItems),
            adress: adressString,
            name: name,
            phone: phone,
            email: email,
            projects: JSON.stringify(projects),
            totalPrice: totalPrice,
            client: $selectedUser.$id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            uploadedImages: uploadedImages.map(image => (JSON.stringify({ id: image.id, category: image.category }))),
            opmerkingen,
            notities,
            terms: JSON.stringify(terms.filter(term => term.checked)),
            paymentSchedule: JSON.stringify(paymentSchedule),
            calculations: JSON.stringify(calculations) // Add calculations to project data
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
    } finally {
        isSaving = false;
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

  async function updateAddress(address: any) {
    console.log('address', address);
    if(address !== undefined && address !== null){
        console.log("add",address);
        let woonplaats = address.city || address.town || address.village || address.municipality;
        adressString = `${address.road} ${address.house_number}, ${address.postcode} ${woonplaats}`;
    }
  }

  $: updateAddress(adress);
</script>
  
    <div class="flex flex-col md:flex-row">
    <div class="md:w-1/2 border border-gray-300 rounded-md m-4 p-4">
        <h2 class="text-lg font-medium">Klantgegevens</h2>
        <div class="relative">
          {#if projectId == "new"}
          <a on:click={() => {$selectedUser = null}}><Recycle class="absolute right-0 cursor-pointer" /></a>
          <br>
          {/if}
          <a href="/client/edit/{$selectedUser?.$id}"><Pencil class="absolute right-0 cursor-pointer" /></a>
          
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
          <div>
            <label for="subcontractor">Hoofdaannemer:</label>
            <span id="subcontractor">{!!$selectedUser?.subcontractors?.businessname ? $selectedUser.subcontractors.businessname : 'Nee'}</span>
          </div>
        </div>
      </div>
      <div class="md:w-1/2 m-4">
        {#if $selectedUser?.type != "Prive"}
        <div class="border border-gray-300 rounded-md p-4">
          <h2 class="text-lg font-medium">Betreft</h2>
          
          <input type="text" bind:value={name} placeholder="Naam" class="w-full border rounded-md p-2 mt-2"/>
          <input type="email" bind:value={email} placeholder="Email" class="w-full border rounded-md p-2 mt-2"/>
          <input type="tel" bind:value={phone} placeholder="Telefoonnummer" class="w-full border rounded-md p-2 mt-2"/>
          <SearchAdress bind:address={adress} class="w-full"/>
          <input type="text" bind:value={adressString} class="w-full border rounded-md p-2 mt-2"/>
        </div>
        {/if}
        <div class="border border-gray-300 rounded-md p-4">
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

  <div class="max-w-4xl mx-auto p-4 space-y-2 flex flex-col gap-4"> 
    <!-- <UserSearch /> -->
     {#each projects as project}
      <div class="border rounded-lg p-2 bg-gray-100">
        <div class="flex justify-between items-center p-2">
          <h1 class="text-lg font-medium">{project.name}</h1>
          <button class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded" on:click={() => removeProject(project.name)}>
            Verwijder
          </button>
        </div>
        <ImageUploader 
            category={project.name} 
            bind:uploadedImages={uploadedImages} 
            bind:isUploading={isUploading}
            on:upload={event => console.log('File uploaded:', event.detail.file)} 
        />
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
                          on:input={(event) => {
                            let price = (event.target as HTMLInputElement).value;
                            project.items = project.items.map((item: Item) => {
                              if (item.category === category) {
                                console.log(price);
                                return {
                                ...item,
                                price: price
                              };
                            }
                            return item;
                          });
                        }}
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
                  <ProjectTask 
                    {project}
                    {category}
                    {item}
                    bind:projects
                  />
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
                        min="1"
                        bind:value={calculations[category].length}
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
                        min="1"
                        bind:value={calculations[category].width}
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
                      min="1"
                      bind:value={calculations[category].length}
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
                    bind:value={calculations[category].length}
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
            <!-- <button class="mt-4 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded" on:click={saveProject}>
              Opslaan & Inplannen
            </button> -->
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
    <ClientSearch />
  </div>
{/if}
<SavingAnimation isVisible={isSaving} />
