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

  onMount(async () => {
    const databases = new Databases(client);
    const databaseId = 'PriceCalc'; // Your database ID
    const projectsCollectionId = '67362a9400133ceb48ac'; // Your collection ID

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
    const databases = new Databases(client);
    const databaseId = 'PriceCalc'; // Your database ID
    const projectsCollectionId = '67362a9400133ceb48ac'; // Your collection ID

    try {
      await databases.updateDocument(databaseId, projectsCollectionId, projectId, { fase: newStatus });
      console.log('Project status updated successfully');
    } catch (error) {
      console.error('Error updating project status:', error);
    }
  }

  

</script>

  {#if projectData}
<div class="top-bar flex justify-end items-center mb-4">
    <div class="flex items-center space-x-4">
      <select bind:value={projectData.fase} class="form-select block w-full mt-1" on:change="{(e) => updateProjectStatus(e.target.value)}">
        <option value="start">start</option>
        <option value="accepted">acceptatie</option>
        <option value="planned">ingeplanned</option>
        <option value="started">gestart</option>
        <option value="in progress">in uitvoering</option>
        <option value="completed">afgerond</option>
      </select>
     
    </div>
    <ShowPdf projectData={projectData} />
  <a href="/project/edit/{projectId}"><button class="bg-blue-500 text-white px-4 py-2 rounded">Bewerk</button></a>
</div>
<div class="flex justify-center flex-wrap">
  <div class="invoice">
    <div class="flex justify-between items-center">
        <h1 class="text-2xl font-bold">Offerte</h1>
     </div>
    <h2 class="text-md">Project ID: {projectId}</h2>
    <br>
    <div class="text-lg">
        <h2>Klant</h2>
      <h3> {projectData.client.name} {projectData.client.lastname}</h3>
      <p>{projectData.client.businessname}</p>
      <p>{projectData.client.adress} {projectData.client.huisnummer}, {projectData.client.postcode} {projectData.client.woonplaats}</p>
      <p>{projectData.client.email}</p>
      <p>{projectData.client.telefoonnummer}</p>
    </div>
    <br><br>
    <div class="items">
      {#each projectData.projects as project}
      <h2>{project.name}</h2>
      {#each project.items as item}
        <div class="item">
          <span>{item.subcategory} - {item.type}</span>
          <span>{item.quantity} x €{item.price}</span>
        </div>
      {/each}
      {/each}
    </div>
    <div class="total">
      {#if projectData.client.businessname}
        <h3>BTW Verlegd</h3>
      {:else}
        <h3 class="font-bold">Totaal (excl. BTW): €{totalPrice.toFixed(2)}</h3>
      {/if}
      <h3 class="font-bold">Totaal: €{totalPriceWithTax.toFixed(2)}</h3>

      <p>Deze offerte is geldig voor 30 dagen</p>
    </div>

    <br><br>
    <div class="taken">
      <h3 class="font-bold">Taken:</h3>
      <ul>
        {#each projectData.tasks as task}
            <li>{task.description}</li>
        {/each}
      </ul>
    </div>
  </div>
  <div class="new-div">
    <div class="header">
      <h2 class="text-2xl font-bold">Opmerkingen</h2>
    </div>
    {projectData.opmerkingen}
    <div class="header">
      <h2 class="text-2xl font-bold">Notities</h2>
    </div>
    {projectData.notities}
    <div class="header">
      <h2 class="text-2xl font-bold">Gerelateerde Foto's</h2>
    </div>
    <FetchImages bind:uploadedImages />
  </div>

</div>
  {:else}
    <p>Loading project data...</p>
  {/if}

<style>
  .invoice {
    padding: 20px;
    max-width: 600px;
    margin: 0 20px;
    border: 1px solid #ccc;
    border-radius: 8px;
  }
  .item {
    display: flex;
    justify-content: space-between;
    padding: 5px 0;
  }
  .total {
    margin-top: 20px;
    font-size: 1.2em;
  }

  ul {
    list-style-type: disc;
  }
</style>
