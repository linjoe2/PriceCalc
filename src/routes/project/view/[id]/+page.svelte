<script lang="ts">
  import { onMount } from 'svelte';
  import { Databases, ID } from "appwrite";
  import { client } from "$lib/appwrite";
  import { page } from '$app/stores';
  import ShowPdf from "../../../../components/showPdf.svelte";
  import FetchImages from "./fetchImages.svelte";
  import type { Project, UploadedImage } from '$lib/types';

  let projectId = $page.params.id;
  let projectData: Project | null = null;
  let uploadedImages: UploadedImage[] = [];

  $: console.log(projectData)

  const databases = new Databases(client);
  const databaseId = 'PriceCalc'; // Your database ID
  const projectsCollectionId = '67362a9400133ceb48ac'; // Your collection ID

  onMount(async () => {
    try {
      const response = await databases.getDocument(databaseId, projectsCollectionId, projectId);
      projectData = {
        ...response,
        items: JSON.parse(response.items),
        projects: JSON.parse(response.projects),
        terms: JSON.parse(response.terms),
        paymentSchedule: JSON.parse(response.paymentSchedule),
        name: response.name,
        client: response.client,
        fase: response.fase,
        tasks: response.tasks,
        opmerkingen: response.opmerkingen,
        notities: response.notities,
        uploadedImages: response.uploadedImages || []
      };
      if (projectData) {
        uploadedImages = projectData.uploadedImages;
      }
      console.log(uploadedImages);
      console.log(projectData);
    } catch (error) {
      console.error('Error fetching project data:', error);
    }
  });

  $: totalPrice = projectData ? projectData.items.reduce((sum: number, item: any) => {
    const price = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
    return sum + (price * item.quantity);
  }, 0) : 0;

  $: totalPriceWithTax = projectData && projectData.client.businessname 
    ? totalPrice 
    : totalPrice * 1.21; // Add 21% tax if no business name

  async function updateProjectStatus(newStatus: string) { 
    try {
      await databases.updateDocument(databaseId, projectsCollectionId, projectId, { fase: newStatus });
      console.log('Project status updated successfully');
    } catch (error) {
      console.error('Error updating project status:', error);
    }
  }

  function incrementVersion(variableName) {
    const versionPattern = /(.*?)(?:_V(\d+))?$/; // Matches variable with optional version
    const match = variableName.match(versionPattern);
    
    if (match) {
        let baseName = match[1];
        let version = match[2] ? parseInt(match[2], 10) + 1 : 2; // Increment version if exists, else start at v2
        return `${baseName}_V${version}`;
    }
    
    return variableName;
}

  async function duplicateProject() {
    try {
      // Create a new project with the same data

      // if projectNumber ends with _V2, add _V3, if _v3 make it v4 etc
    
      let newProjectNumber = incrementVersion(projectData.projectNumber);

      console.log(projectData);
      const newProjectData = { 
        ...projectData,
        projectNumber: newProjectNumber
      };
      // //delete all that starts with $
      for (const key in newProjectData) {
        if (key.startsWith('$')) {
          delete newProjectData[key];
        }
      }
      // delete newProjectData.client;
      newProjectData.client = projectData.client.$id;
      // delete newProjectData.projects;
      newProjectData.projects = JSON.stringify(projectData.projects);
      newProjectData.items = JSON.stringify(projectData.items);
      // delete newProjectData.terms;
      newProjectData.terms = JSON.stringify(projectData.terms);
      // delete newProjectData.paymentSchedule;
      newProjectData.paymentSchedule = JSON.stringify(projectData.paymentSchedule);
      delete newProjectData.name;
      // delete newProjectData.fase;
      // delete newProjectData.tasks;
      // newProjectData.tasks = JSON.stringify(projectData.tasks);
      //map over tasks and making an array of id's
      newProjectData.tasks = projectData.tasks.map((task: any) => task.$id);
      // delete newProjectData.opmerkingen;
      // delete newProjectData.notities;
      // delete newProjectData.uploadedImages;
      // Add "(Copy)" to the project names
      // newProjectData.projects = newProjectData.projects?.map(project => ({
      //   ...project,
      //   projectNumber: `${project.projectNumber}_V2`
      // }));
      console.log(newProjectData);
      
      const response = await databases.createDocument(
        databaseId,
        projectsCollectionId,
        ID.unique(),
        newProjectData
      );

      // Redirect to the new project
      window.location.href = `/project/view/${response.$id}`;
    } catch (error) {
      console.error('Error duplicating project:', error);
    }
  }

</script>

{#if projectData}
<div class="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
  <div class="max-w-7xl mx-auto">
    <!-- Top Bar -->
    <div class="bg-white shadow rounded-lg p-4 mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
      <select 
        bind:value={projectData.fase} 
        class="block w-full sm:w-48 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        on:change="{(e) => updateProjectStatus((e.target as HTMLSelectElement).value)}"
      >
        <option value="start">start</option>
        <option value="accepted">acceptatie</option>
        <option value="planned">ingeplanned</option>
        <option value="started">gestart</option>
        <option value="in progress">in uitvoering</option>
        <option value="completed">afgerond</option>
      </select>
      
      <div class="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
        <ShowPdf projectData={projectData} />
        <button
          on:click={duplicateProject}
          class="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          Dupliceer
        </button>
        <a 
          href="/project/edit/{projectId}" 
          class="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Bewerk
        </a>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex flex-col lg:flex-row gap-6">
      <!-- Left Column - Invoice -->
      <div class="w-full lg:flex-1 bg-white shadow rounded-lg p-4 sm:p-6">
        <div class="border-b border-gray-200 pb-4">
          <h1 class="text-3xl font-bold text-gray-900">Offerte</h1>
          <p class="text-sm text-gray-500 mt-1">Offerte nummer: {projectData.projectNumber}</p>
        </div>

        <!-- Client Information -->
        <div class="mt-6">
          <h2 class="text-xl font-semibold text-gray-900">Klant</h2>
          <div class="mt-3 text-gray-600">
            <p class="font-medium">{projectData.client.name} {projectData.client.lastname}</p>
            {#if projectData.client.businessname}
              <p class="text-gray-700">{projectData.client.businessname}</p>
            {/if}
            <p>{projectData.client.adress} {projectData.client.huisnummer}</p>
            <p>{projectData.client.postcode} {projectData.client.woonplaats}</p>
            <p class="mt-2">{projectData.client.email}</p>
            <p>{projectData.client.telefoonnummer}</p>
          </div>
        </div>

        <!-- Projects and Items -->
        <div class="mt-8 overflow-x-auto">
          {#each projectData.projects as project}
            <div class="mb-6">
              <h2 class="text-lg font-semibold text-gray-900">{project.name}</h2>
              <div class="mt-3 space-y-2">
                {#each project.items as item}
                  <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center py-2 border-b border-gray-100">
                    <span class="text-gray-600 mb-1 sm:mb-0">{item.subcategory} - {item.type}</span>
                    <span class="font-medium">{item.quantity} {item.unit} x €{item.price}</span>
                  </div>
                {/each}
              </div>
            </div>
          {/each}
        </div>

        <!-- Total -->
        <div class="mt-8 bg-gray-50 rounded-lg p-4">
          {#if projectData.client.businessname}
            <p class="text-lg font-semibold text-gray-700">BTW Verlegd</p>
          {:else}
            <p class="text-lg text-gray-700">Totaal (excl. BTW): <span class="font-semibold">€{totalPrice.toFixed(2)}</span></p>
          {/if}
          <p class="text-xl font-bold text-gray-900 mt-2">Totaal: €{totalPriceWithTax.toFixed(2)}</p>
        </div>

        <!-- Tasks -->
        <div class="mt-8">
          <h3 class="text-xl font-semibold text-gray-900">Taken</h3>
          <ul class="mt-4 space-y-2 list-disc list-inside text-gray-600">
            {#each projectData.tasks as task}
              <li>{task.description}</li>
            {/each}
          </ul>
        </div>

      <!-- Terms -->
        <div class="mt-8">
          <h3 class="text-xl font-semibold text-gray-900">Voorwaarden</h3>
          <ul class="mt-4 space-y-2 list-disc list-inside text-gray-600">
            {#each projectData.terms as term}
              <li>{term.text}</li>
            {/each}
          </ul>
        </div>
      </div>
 

      <!-- Right Column - Notes and Images -->
      <div class="w-full lg:w-1/3 space-y-6">
        <!-- Notes Section -->

        <div class="bg-white shadow rounded-lg p-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Notities</h2>
          <p class="text-gray-600 whitespace-pre-line">{projectData.notities}</p>
        </div>

        <div class="bg-white shadow rounded-lg p-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Gerelateerde Foto's</h2>
          <FetchImages bind:uploadedImages />
        </div>

        <!-- Payment Schedule Card -->
        <div class="bg-white shadow rounded-lg p-4 sm:p-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Betalingsschema (excl. BTW)</h2>
          <div class="space-y-4">
            {#if projectData.paymentSchedule.initial > 0}
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center py-2 border-b border-gray-100">
              <span class="text-gray-600 mb-1 sm:mb-0">Aanbetaling ({projectData.paymentSchedule.initial}%)</span>
              <span class="font-medium">€{(totalPrice * projectData.paymentSchedule.initial / 100).toFixed(2)}</span>
            </div>
            {/if}
            {#if projectData.paymentSchedule.during > 0}
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center py-2 border-b border-gray-100">
              <span class="text-gray-600 mb-1 sm:mb-0">Tijdens werkzaamheden ({projectData.paymentSchedule.during}%)</span>
              <span class="font-medium">€{(totalPrice * projectData.paymentSchedule.during / 100).toFixed(2)}</span>
            </div>
            {/if}
            {#if projectData.paymentSchedule.threequarters > 0}
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center py-2 border-b border-gray-100">
              <span class="text-gray-600 mb-1 sm:mb-0">Bij driekwart gereed ({projectData.paymentSchedule.threequarters}%)</span>
              <span class="font-medium">€{(totalPrice * projectData.paymentSchedule.threequarters / 100).toFixed(2)}</span>
            </div>
            {/if}
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center py-2 border-b border-gray-100">
              <span class="text-gray-600 mb-1 sm:mb-0">Bij oplevering ({projectData.paymentSchedule.final}%)</span>
              <span class="font-medium">€{(totalPrice * projectData.paymentSchedule.final / 100).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
{:else}
<div class="min-h-screen flex items-center justify-center">
  <div class="animate-pulse text-gray-600">Project data laden...</div>
</div>
{/if}

