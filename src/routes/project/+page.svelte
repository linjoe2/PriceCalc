<script lang="ts">
  import { onMount } from 'svelte';
  import { Databases, Query } from "appwrite";
  import { client } from "$lib/appwrite";
  import Plus from "lucide-svelte/icons/plus";
  import Pencil from "lucide-svelte/icons/pencil";
  import Trash from "lucide-svelte/icons/trash";
  import Eye from "lucide-svelte/icons/eye";

  const databases = new Databases(client);
  const databaseId = 'PriceCalc'; // Your database ID
  const collectionId = '67362a9400133ceb48ac'; // Your collection ID

  let services = [];

  onMount(async () => {
    try {
        // Fetching documents from Appwrite
        const response = await databases.listDocuments(databaseId, collectionId, [Query.limit(100), Query.offset(0)]);
        services = response.documents;
        console.log(response);
    } catch (error) {
        console.error('Error fetching services:', error);
    }
  });

  async function deleteProject(id: string) {
    await databases.deleteDocument(databaseId, collectionId, id);
    services = services.filter(service => service.$id !== id);
  }
</script>

<div class="flex flex-col gap-4 max-w-400px">

<div class="flex justify-between items-center">
 <h1>Projects</h1>
  <a href="/project/edit/new" ><button ><Plus class="h-4 w-4" /></button></a>
</div>

  <table class="w-full">
    <thead>
      <tr>
        <th class="text-left">Klant</th>
        <th class="text-left">Adres</th>
        <th class="text-left">Datum</th>
        <th class="text-left">Artikelen</th>
        <th class="text-right">Acties</th>
      </tr>
    </thead>
    <tbody>
      {#each services as offer}
        <tr on:click={() => window.location.href = `/project/view/${offer.$id}`} class="cursor-pointer">
          <td>{offer.client?.name} {offer.client?.lastname}</td>
          <td>{offer.client?.adress} {offer.client?.huisnummer}</td>
          <td>{new Date(offer.updatedAt).toLocaleDateString('nl-NL', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
          <td>{JSON.parse(offer.items).length} items</td>
          <td class="text-right">
            <a href="/project/edit/{offer.$id}" class="mr-2"><button><Pencil class="h-4 w-4" /></button></a>
            <button on:click={() => deleteProject(offer.$id)} class="ml-2"><Trash class="h-4 w-4" /></button>
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>


<style>
 tr {
    margin-bottom: 20px;
  }
</style>
