<script lang="ts">
  import { onMount } from 'svelte';
  import { Databases } from "appwrite";
  import { client } from "$lib/appwrite";
  import { page } from '$app/stores';
  import FetchImages from "./fetchImages.svelte";
  
  let projectId = $page.params.id;
  let projectData = null;
  let uploadedImages: string[] = [];

  onMount(async () => {
    const databases = new Databases(client);
    const databaseId = 'PriceCalc'; // Your database ID
    const projectsCollectionId = '67362a9400133ceb48ac'; // Your collection ID

    try {
      projectData = await databases.getDocument(databaseId, projectsCollectionId, projectId);
      projectData.items = JSON.parse(projectData.items);
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
</script>

  {#if projectData}
<div class="top-bar flex justify-end items-center mb-4">
    <div class="flex items-center space-x-4">
      <select bind:value={projectData.fase} class="form-select block w-full mt-1">
        <option value="start">start</option>
        <option value="in-progress">acceptatie</option>
        <option value="completed">ingeplanned</option>
        <option value="cancelled">in uitvoering</option>
        <option value="cancelled">afgerond</option>
      </select>
     
    </div>
  <button class="send-email-button bg-green-500 text-white px-4 py-2 rounded">Verstuur Email</button>
  <a href="/project/edit/{projectId}"><button class="bg-blue-500 text-white px-4 py-2 rounded">Bewerk</button></a>
</div>
<div class="flex justify-center">
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
      {#each projectData.items as item}
        <div class="item">
          <span>{item.subcategory} - {item.type}</span>
          <span>{item.quantity} x €{item.price}</span>
        </div>
      {/each}
    </div>
    <div class="total">
      <h3 class="font-bold">Total: €{totalPrice.toFixed(2)}</h3>
    </div>

    <br><br>
    <div class="voorwaarden">
      <h3 class="font-bold">Voorwaarden:</h3>
      <ul>
        <li>Kosteloos gebruik van toilet, stroom- & watervoorzieningen</li>
        <li>Exclusief parkeerkosten, deze worden 1:1 in rekening gebracht</li>
        <li>Exclusief vergunningskosten, deze kosten worden na de aanvraag 1:1 in rekening gebracht</li>
        <li>Kosten dakbeschot vervangen per m2: € 95, - inclusief arbeidsloon indien nodig</li>
        <li>Steiger benodigd voor uitvoering werkzaamheden, dit wordt geregeld door derde</li>
        <li>Exclusief steigerwerk</li>
        <li>Exclusief aanbrengen afschot gootbodem</li>
        <li>Klant gaat akkoord met het gegeven dat er plassen water op het dak blijven liggen</li>
        <li>Exclusief afwerken binnenzijde lichtkoepel/lichtstraat</li>
        <li>Indien de buren meedoen met het renoveren van de dakbedekking kan er … % korting worden gegeven op de totaalprijs excl. BTW</li>
        <li>Toegang tot de benedenwoning is vereist i.v.m. met het plaatsen van de steiger in de achtertuin</li>
        <li>Dakterras dient verwijderd te zijn voor aanvang werkzaamheden</li>
        <li>Extra kosten hoogwerker bij slechte weersomstandigheden worden doorberekend aan de klant</li>
        <li>Opdrachtgever is zelf verantwoordelijk of schoorsteen nog in gebruik is</li>
        <li>Planten bakken, tuinmeubilair, gaashekken etc. dienen verwijderd te zijn door opdrachtgever voor aanvang werkzaamheden, indien niet verwijderd zullen hier extra kosten voor in rekening gebracht worden</li>
        <li>Voor het aansluiten van de hemelwaterafvoer dient er een voorziening onder straat niveau aanwezig te zijn, indien niet aanwezig zal de gemeente deze moeten aanleggen.</li>
      </ul>
    </div>
  </div>
  <div class="new-div">
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
