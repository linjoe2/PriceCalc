<script lang="ts">
  import { onMount } from 'svelte';
  import { Databases } from "appwrite";
  import { client } from "$lib/appwrite";
  import { page } from '$app/stores';
  import ShowPdf from "../../../../components/showPdf.svelte";
  import FetchImages from "./fetchImages.svelte";
  
  let projectId = $page.params.id;
  let projectData = null;
  let uploadedImages: string[] = [];


  $: console.log(projectData)

  const databases = new Databases(client);
  const databaseId = 'PriceCalc'; // Your database ID
  const projectsCollectionId = '67362a9400133ceb48ac'; // Your collection ID

  onMount(async () => {
    try {
      projectData = await databases.getDocument(databaseId, projectsCollectionId, projectId);
      projectData.items = JSON.parse(projectData.items);
      projectData.projects = JSON.parse(projectData.projects);
      uploadedImages = projectData.uploadedImages;
      console.log(uploadedImages);
      console.log(projectData);
    } catch (error) {
      console.error('Error fetching project data:', error);
    }
  });

  $: totalPrice = projectData ? projectData.items.reduce((sum, item) => {
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

  async function duplicateProject() {
    try {
      // Create a new project with the same data
      console.log(projectData);
      const newProjectData = { ...projectData };
      delete newProjectData.$id;  // Remove the original ID
      delete newProjectData.$createdAt;
      delete newProjectData.$updatedAt;
      
      // Add "(Copy)" to the project names
      newProjectData.projects = newProjectData.projects.map(project => ({
        ...project,
        name: `${project.name} (Copy)`
      }));

      // Convert arrays back to strings before sending to database
      newProjectData.items = JSON.stringify(newProjectData.items);
      newProjectData.projects = JSON.stringify(newProjectData.projects);

      const response = await databases.createDocument(
        databaseId,
        projectsCollectionId,
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
    <div class="bg-white shadow rounded-lg p-4 mb-6 flex justify-between items-center">
      <select 
        bind:value={projectData.fase} 
        class="block w-48 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        on:change="{(e) => updateProjectStatus(e.target.value)}"
      >
        <option value="start">start</option>
        <option value="accepted">acceptatie</option>
        <option value="planned">ingeplanned</option>
        <option value="started">gestart</option>
        <option value="in progress">in uitvoering</option>
        <option value="completed">afgerond</option>
      </select>
      
      <div class="flex space-x-4">
        <ShowPdf projectData={projectData} />
        <button
          on:click={duplicateProject}
          class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          Dupliceer
        </button>
        <a href="/project/edit/{projectId}" class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
          Bewerk
        </a>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex flex-col lg:flex-row gap-6">
      <!-- Left Column - Invoice -->
      <div class="flex-1 bg-white shadow rounded-lg p-6">
        <div class="border-b border-gray-200 pb-4">
          <h1 class="text-3xl font-bold text-gray-900">Offerte</h1>
          <p class="text-sm text-gray-500 mt-1">Project ID: {projectId}</p>
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
        <div class="mt-8">
          {#each projectData.projects as project}
            <div class="mb-6">
              <h2 class="text-lg font-semibold text-gray-900">{project.name}</h2>
              <div class="mt-3 space-y-2">
                {#each project.items as item}
                  <div class="flex justify-between items-center py-2 border-b border-gray-100">
                    <span class="text-gray-600">{item.subcategory} - {item.type}</span>
                    <span class="font-medium">{item.quantity} x €{item.price}</span>
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
      </div>

      <!-- Right Column - Notes and Images -->
      <div class="lg:w-1/3 space-y-6">
        <!-- Notes Section -->
        <div class="bg-white shadow rounded-lg p-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Opmerkingen</h2>
          <p class="text-gray-600 whitespace-pre-line">{projectData.opmerkingen}</p>
        </div>

        <div class="bg-white shadow rounded-lg p-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Notities</h2>
          <p class="text-gray-600 whitespace-pre-line">{projectData.notities}</p>
        </div>

        <div class="bg-white shadow rounded-lg p-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Gerelateerde Foto's</h2>
          <FetchImages bind:uploadedImages />
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

