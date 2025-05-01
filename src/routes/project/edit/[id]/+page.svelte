<script lang="ts">
  // import UserSearch from '../../userSearch.svelte';
  import { onMount } from 'svelte';
  import { Databases, Query } from "appwrite";
  import { client, account } from "$lib/appwrite";
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
  import { ArrowUp, ArrowDown } from 'lucide-svelte';
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
  let openCategories: Record<string, Record<string, boolean>> = {};  // Update the type to nest by project
  let isUploading = false; // Add this near other let declarations at the top
  let calculations: Record<string, Calculation> = {};
  let projectNumber: string = '';
  let adress = null;
  let adressString = '';
  let name = '';
  let phone = '';
  let email = '';
  let projectData: Project | null = null;

  onMount(async () => {
    try {
        const response = await databases.listDocuments(databaseId, itemsCollectionId, [Query.limit(100),Query.offset(0)]);
        services = response.documents.reduce((acc: Record<string, Service[]>, doc) => {
            const { category, subcategory, type, price, unit, tasks, order } = doc;
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
                tasks,
                order: parseFloat(order || '0') // Ensure order is a number
            });
            return acc;
        }, {});

        // Sort categories based on the order of the first item in each category
        services = Object.fromEntries(
            Object.entries(services).sort(([, a], [, b]) => {
                const aOrder = parseFloat(a[0]?.order || '0');
                const bOrder = parseFloat(b[0]?.order || '0');
                return aOrder - bOrder;
            })
        );

        // Sort items within each category
        for (const category in services) {
            services[category].sort((a, b) => {
                const aOrder = parseFloat(a.order || '0');
                const bOrder = parseFloat(b.order || '0');
                return aOrder - bOrder;
            });
        }

        console.log(response)

        if (projectId === "new" && !projectNumber) {
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
            console.log('Generated new project number:', projectNumber);
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
            // Set project number first to ensure it's preserved
            projectNumber = result.projectNumber;
            console.log('Loaded existing project number:', projectNumber);
            
            // Initialize terms from project data
            const projectTerms = JSON.parse(result.terms || '[]');
            // Create a map of project terms by text for easy lookup
            const projectTermsMap = new Map(projectTerms.map(term => [term.text, term]));
            // Load all terms from database
            const termsResponse = await databases.listDocuments(databaseId, '67a280b30007409faa24');
            terms = termsResponse.documents.map(doc => ({
                ...doc,
                checked: projectTermsMap.get(doc.text)?.checked || false,
                order: doc.order || 0
            }));
            paymentSchedule = JSON.parse(result.paymentSchedule || '{"initial": 50, "during": 45, "final": 5}');
            // Set project data
            projectData = {
                ...result,
                items: JSON.parse(result.items),
                projects: JSON.parse(result.projects),
                terms: JSON.parse(result.terms || '[]'),
                paymentSchedule: JSON.parse(result.paymentSchedule || '{"initial": 50, "during": 45, "final": 5}'),
                name: result.name || '',
                client: result.client,
                fase: result.fase || 'opstellen offerte',
                tasks: result.tasks || [],
                opmerkingen: result.opmerkingen || '',
                notities: result.notities || '',
                uploadedImages: result.uploadedImages || [],
                projectNumber: result.projectNumber || '',
                adress: result.adress || '',
                progress: result.progress || 0
            };
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

  // Add a reactive statement to ensure items stay sorted
  $: {
    for (const category in services) {
        if (services[category]) {
            services[category].sort((a, b) => {
                const aOrder = parseFloat(a.order || '0');
                const bOrder = parseFloat(b.order || '0');
                return aOrder - bOrder;
            });
        }
    }
  }

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
          quantity: 1, // Set initial quantity to 1
          tasks: initialTasks,
          projectName: project.name // Add project name to the item
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
        const allItems = projects.flatMap(project => 
            project.items.map(item => ({
                ...item,
                tasks: item.tasks || [],
                calculations: calculations[item.category] || {}
            }))
        );
        let loggedInUser = await account.get();
        const projectData: Partial<Project> = {
            projectNumber: projectNumber,
            items: JSON.stringify(allItems),
            adress: adressString,
            name: name,
            phone: phone,
            email: email,
            projects: JSON.stringify(projects),
            totalPrice: totalPrice,
            client: $selectedUser.$id,
            updatedAt: new Date().toISOString(),
            lastUpdatedBy: `${loggedInUser.name}`,
            uploadedImages: uploadedImages.map(image => (JSON.stringify({ id: image.id, category: image.category }))),
            opmerkingen,
            notities,
            terms: JSON.stringify(terms.filter(term => term.checked)),
            paymentSchedule: JSON.stringify(paymentSchedule),
            calculations: JSON.stringify(calculations),
            // Add search field for better querying
            search: [
                projectNumber,
                $selectedUser?.adress,
                $selectedUser?.huisnummer,
                $selectedUser?.postcode,
                $selectedUser?.woonplaats,
                adressString
            ].filter(Boolean).join(' ').toLowerCase()
        };

        if (projectId === "new") {
            projectData.createdAt = new Date().toISOString();
            projectData.createdBy = `${loggedInUser.name}`;
        }

        console.log('Saving project with number:', projectNumber);
        console.log('Project data:', projectData);
        
        // Generate tasks from all items across all projects
        projectData.tasks = projects.flatMap(project => 
            project.items.flatMap(item => {
                if (!item.tasks) return [];
                const tasksArray = typeof item.tasks === 'string' ? JSON.parse(item.tasks) : item.tasks;
                return tasksArray.map(task => ({
                    category: item.category,
                    subcategory: item.subcategory,
                    type: item.type,
                    completed: false,
                    description: task.description,
                    projectName: project.name // Use the project name directly from the project
                }));
            })
        );

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
      projects = [...projects, {
        name: newProjectName, 
        items: [],
        isEditingName: false
      }]; // Add the new project name to the projects array
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
        adressString = `${address.road} ${address.house_number}\n${address.postcode} ${woonplaats}`;
    }
  }

  $: updateAddress(adress);

  function moveProject(index: number, direction: 'up' | 'down') {
    if ((direction === 'up' && index > 0) || (direction === 'down' && index < projects.length - 1)) {
      const newProjects = [...projects];
      const temp = newProjects[index];
      if (direction === 'up') {
        newProjects[index] = newProjects[index - 1];
        newProjects[index - 1] = temp;
      } else {
        newProjects[index] = newProjects[index + 1];
        newProjects[index + 1] = temp;
      }
      projects = newProjects;
    }
  }

  function startEditingName(project: Project) {
    project.isEditingName = true;
    projects = [...projects];
  }

  function finishEditingName(project: Project, event: KeyboardEvent | FocusEvent) {
    if (event instanceof KeyboardEvent && event.key !== 'Enter') {
      return;
    }
    project.isEditingName = false;
    projects = [...projects];
  }
</script>
  
    <div class="flex flex-col md:flex-row">
    <div class="md:w-1/2 border border-gray-300 rounded-md m-4 p-4">
        <h2 class="text-lg font-medium">Opdrachtgever</h2>
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
         
        </div>
      </div>
      <div class="md:w-1/2 m-4">
        {#if $selectedUser?.type != "Prive"}
        <div class="border border-gray-300 rounded-md p-4">
          <h2 class="text-lg font-medium">Werkadres</h2>
          
          <input type="text" bind:value={name} placeholder="Naam" class="w-full border rounded-md p-2 mt-2"/>
          {#if $selectedUser?.type != "Bedrijf"}
            <input type="email" bind:value={email} placeholder="Email" class="w-full border rounded-md p-2 mt-2"/>
            <input type="tel" bind:value={phone} placeholder="Telefoonnummer" class="w-full border rounded-md p-2 mt-2"/>
          {/if}
          <SearchAdress bind:address={adress} class="w-full"/>
          <textarea bind:value={adressString} class="w-full border rounded-md p-2 mt-2"/>
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

  <div class="w-full mx-auto p-4 space-y-2 flex flex-col gap-4"> 
    <!-- <UserSearch /> -->
     {#each projects as project, index}
      <div class="border rounded-lg p-2 bg-gray-100">
        <div class="flex justify-between items-center p-2">
          <div class="flex items-center gap-2">
            <div class="flex flex-col">
              <button 
                class="text-gray-500 hover:text-gray-700 disabled:opacity-50"
                on:click={() => moveProject(index, 'up')}
                disabled={index === 0}
              >
                <ArrowUp size={20} />
              </button>
              <button 
                class="text-gray-500 hover:text-gray-700 disabled:opacity-50"
                on:click={() => moveProject(index, 'down')}
                disabled={index === projects.length - 1}
              >
                <ArrowDown size={20} />
              </button>
            </div>
            {#if project.isEditingName}
              <input 
                type="text" 
                bind:value={project.name}
                class="text-lg font-medium border rounded px-2 py-1"
                on:blur={(e) => finishEditingName(project, e)}
                on:keydown={(e) => finishEditingName(project, e)}
                use:clickOutside={() => {
                  project.isEditingName = false;
                  projects = [...projects];
                }}
              />
            {:else}
              <h1 
                class="text-lg font-medium cursor-pointer hover:text-blue-600"
                on:click={() => startEditingName(project)}
              >
                {project.name}
              </h1>
            {/if}
          </div>
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
          on:click={() => {
            // Initialize nested structure if it doesn't exist
            openCategories[project.name] = openCategories[project.name] || {};
            openCategories[project.name][category] = !openCategories[project.name]?.[category];
          }}
        >
          <div class="flex items-center gap-3">
            <span class="font-medium">{category}</span>
          </div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5 transform transition-transform {openCategories[project.name]?.[category] ? 'rotate-180' : ''}"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {#if openCategories[project.name]?.[category] || items.some((item: Item) => project.items.some((selected: Item) => selected.category === category && selected.subcategory === item.subcategory && selected.type === item.type))}
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
                        on:blur={() => {
                          const projectItem = project.items.find(i => i.category === category && i.subcategory === item.subcategory && i.type === item.type);
                          if (projectItem) projectItem.isEditing = false;
                        }}
                        use:clickOutside={() => {
                          const projectItem = project.items.find(i => i.category === category && i.subcategory === item.subcategory && i.type === item.type);
                          if (projectItem) projectItem.isEditing = false;
                        }}
                      />
                    {:else}
                      {#if project.items.find(i => i.category === category && i.subcategory === item.subcategory && i.type === item.type)}
                        <div on:click|stopPropagation={() => {
                          const projectItem = project.items.find(i => i.category === category && i.subcategory === item.subcategory && i.type === item.type);
                          if (projectItem) {
                            projectItem.isEditing = true;
                            projects = [...projects];
                            setTimeout(() => {
                              const input = document.querySelector(`input[data-item-id="${item.type}-${item.subcategory}"]`) as HTMLInputElement;
                              if (input) input.focus();
                            }, 0);
                          }
                        }}>
                          {#if project.items.find(i => i.category === category && i.subcategory === item.subcategory && i.type === item.type)?.isEditing}
                            <input 
                              type="number"
                              data-item-id="{item.type}-{item.subcategory}"
                              value={project.items.find(i => i.category === category && i.subcategory === item.subcategory && i.type === item.type)?.price}
                              on:input={(event) => {
                                let price = (event.target as HTMLInputElement).value;
                                project.items = project.items.map((projectItem: Item) => {
                                  if (projectItem.category === category && 
                                      projectItem.subcategory === item.subcategory && 
                                      projectItem.type === item.type) {
                                    return {
                                      ...projectItem,
                                      price: price
                                    };
                                  }
                                  return projectItem;
                                });
                                projects = [...projects];
                              }}
                              on:blur={() => {
                                const projectItem = project.items.find(i => i.category === category && i.subcategory === item.subcategory && i.type === item.type);
                                if (projectItem) {
                                  projectItem.isEditing = false;
                                  projects = [...projects];
                                }
                              }}
                              use:clickOutside={() => {
                                const projectItem = project.items.find(i => i.category === category && i.subcategory === item.subcategory && i.type === item.type);
                                if (projectItem) {
                                  projectItem.isEditing = false;
                                  projects = [...projects];
                                }
                              }}
                              on:keydown={(event) => {
                                if (event.key === 'Enter') {
                                  const projectItem = project.items.find(i => i.category === category && i.subcategory === item.subcategory && i.type === item.type);
                                  if (projectItem) {
                                    projectItem.isEditing = false;
                                    projects = [...projects];
                                  }
                                }
                              }}
                            />
                          {:else}
                            €{typeof project.items.find(i => i.category === category && i.subcategory === item.subcategory && i.type === item.type)?.price === 'number' 
                              ? project.items.find(i => i.category === category && i.subcategory === item.subcategory && i.type === item.type)?.price.toLocaleString('nl-NL', {minimumFractionDigits: 2, maximumFractionDigits: 2}) 
                              : project.items.find(i => i.category === category && i.subcategory === item.subcategory && i.type === item.type)?.price}{#if item.unit !== "custom"}/{item.unit}{/if}
                          {/if}
                        </div>
                      {:else}
                        €{typeof item.price === 'number' ? item.price.toLocaleString('nl-NL', {minimumFractionDigits: 2, maximumFractionDigits: 2}) : item.price}{#if item.unit !== "custom"}/{item.unit}{/if}
                      {/if}
                    {/if}
                  </span>
                </div>

                {#if project.items.some((i: Item) => i.category === category && i.subcategory === item.subcategory && i.type === item.type)}
                  <div class="flex items-center gap-2 ml-4">
                    <label class="text-sm text-gray-600">Aantal:</label>
                    <input 
                      type="number" 
                      min="1"
                      value={project.items.find((i: Item) => i.category === category && i.subcategory === item.subcategory && i.type === item.type)?.quantity || 1}
                      on:input={(event) => {
                        const quantity = parseFloat((event.target as HTMLInputElement).value);
                        project.items = project.items.map((i: Item) => {
                          if (i.category === category && i.subcategory === item.subcategory && i.type === item.type) {
                            return {
                              ...i,
                              quantity: quantity
                            };
                          }
                          return i;
                        });
                        projects = [...projects];
                      }}
                      class="w-24 p-1 border rounded-md"
                    />
                    <span class="text-sm text-gray-600">{item.unit}</span>
                  </div>
                  <ProjectTask 
                    {project}
                    {category}
                    {item}
                    bind:projects
                  />
                {/if}
              </div>
            {/each}
          </div>
        {/if}
      </div>
    {/each}
    </div>

    
    
    {/each}

  
    <input 
      type="text" 
      bind:value={newProjectName} 
      placeholder="Vul onderdeel naam in" 
      class="mt-2 p-2 border rounded-md"
      on:keypress={(event) => event.key === 'Enter' && addProject()}
    />
   
    <button class="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" on:click={addProject}>
      Onderdeel toevoegen
    </button>

    <TermsComponent bind:terms={terms} bind:projectData={projectData} />

    <CreatePaymentSchedule bind:totalPrice={totalPrice} bind:paymentSchedule={paymentSchedule} />

    {#if projects.length > 0 || uploadedImages.length > 0}
      <button 
        class="fixed bottom-4 right-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg"
        on:click={saveProject}
      >
        Opslaan
      </button>
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
