<script lang="ts">
  import { onMount } from 'svelte';
  import { Databases } from "appwrite";
  import { client } from "$lib/appwrite";
  import { page } from '$app/stores';
  import Pencil from "lucide-svelte/icons/pencil";
  let projectId = $page.params.id;
  let projectData = null;

  onMount(async () => {
    const databases = new Databases(client);
    const databaseId = 'PriceCalc'; // Your database ID
    const projectsCollectionId = '67362a9400133ceb48ac'; // Your collection ID

    try {
      projectData = await databases.getDocument(databaseId, projectsCollectionId, projectId);
      projectData.items = JSON.parse(projectData.items);
    } catch (error) {
      console.error('Error fetching project data:', error);
    }
  });

  $: totalPrice = projectData ? projectData.items.reduce((sum, item) => {
    const price = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
    return sum + (price * item.quantity);
  }, 0) : 0;
</script>

<div class="invoice">
  <div class="flex justify-between items-center">
    <h1 class="text-2xl font-bold">Offerte</h1>
    <a href="/project/edit/{projectId}"><button><Pencil class="h-4 w-4" /></button></a>
  </div>
  {#if projectData}
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
  {:else}
    <p>Loading project data...</p>
  {/if}
</div>

<style>
  .invoice {
    padding: 20px;
    max-width: 600px;
    margin: auto;
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
</style>
