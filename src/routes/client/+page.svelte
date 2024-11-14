<script lang="ts">
    import { Databases } from "appwrite";
  import * as Card from "$lib/components/ui/card";
    import UserRoundPen from "lucide-svelte/icons/user-round-pen";
    import PencilRuler from "lucide-svelte/icons/pencil-ruler"
    
     import { client } from '$lib/appwrite';
     import {onMount} from "svelte";

     const databases = new Databases(client);
    let clients = [];

    onMount(async ()=>{
    const result = await databases.listDocuments(
      'PriceCalc', // databaseId
      '67362abc0039525e36b6', // collectionId
      [] // queries (optional)
     );

      console.log(result);
      clients = result.documents
    })
</script>

  
    <h1>Klanten</h1>
    <a href="/client/new" ><button >+ Nieuw</button></a>
    
    <ul class="list-disc pl-5">
      {#each clients as client}
        <li class="flex justify-between items-center">
          <span class="text-lg font-semibold">{client.name} {client.lastname}</span>
          <span>{client.adress} {client.huisnummer} {client.postcode} {client.woonplaats}</span>
          <div class="flex space-x-2">
            <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              <UserRoundPen/>
            </button>
            <button class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
              <PencilRuler/>
            </button>
          </div>
        </li>
      {/each}
    </ul>