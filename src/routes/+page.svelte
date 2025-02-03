<script>
  import { Databases, Query } from 'appwrite';
  import { client } from '$lib/appwrite';
  import { onMount } from 'svelte';
  const databases = new Databases(client);
  // Get the latest 5 clients
  const getLatestClients = async () => {
    try {
        const response = await databases.listDocuments( 
      'PriceCalc',
      '67362abc0039525e36b6',
      [
        Query.orderDesc('$createdAt'), // Order by creation date, newest first
        Query.limit(5) // Limit to 5 results
      ]
    );
    
    return response.documents;
  } catch (error) {
    console.error('Error fetching latest clients:', error);
    throw error;
  }
};

onMount(async () => {
  const latestClients = await getLatestClients();
  console.log(latestClients);
});
</script>
<h1 class="text-2xl font-bold mb-4">Eerst volgende agendapunten</h1>

<h1 class="text-2xl font-bold mb-4">Laatst toegevoegde klanten</h1>
<div class="latest-clients">
  {#await getLatestClients() then latestClients}
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {#each latestClients as client}
        <div class="card border rounded-lg p-4 shadow-md cursor-pointer" on:click={() => window.location.href = `/client/view/${client.$id}`}>
          <h2 class="text-xl font-bold mb-2">{client.name} {client.lastname}</h2>
          <p><strong>Address:</strong> {client.adress} {client.huisnummer}</p>
          <p><strong>Postal Code:</strong> {client.postcode}</p>
          <p><strong>City:</strong> {client.woonplaats}</p>
        </div>
      {/each}
    </div>
  {:catch error}
    <p class="text-red-500">Error loading latest clients: {error.message}</p>
  {/await}
</div>
