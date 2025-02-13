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
<h1 class="text-2xl font-bold mb-4">Eerst volgende agendapunt</h1>

<div class="flex justify-between items-center mb-4">
  <h1 class="text-2xl font-bold">Laatst toegevoegde klanten</h1>

</div>

<div class="latest-clients">
  {#await getLatestClients() then latestClients}
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {#each latestClients as client}
        <a href="/client/view/{client.$id}" class="card block border rounded-lg p-4 shadow-md hover:shadow-lg">
          <h2 class="text-xl font-bold mb-2">{client.name} {client.lastname}</h2>
          <p><strong>Address:</strong> {client.adress} {client.huisnummer}</p>
          <p><strong>Postal Code:</strong> {client.postcode}</p>
          <p><strong>City:</strong> {client.woonplaats}</p>
        </a>
      {/each}
      <a href="/client/new" class="card border rounded-lg p-4 shadow-md cursor-pointer flex items-center justify-center text-center">
        <span class="text-xl font-bold">Nieuwe klant toevoegen</span>
      </a>
    </div>
  {:catch error}
    <p class="text-red-500">Error loading latest clients: {error.message}</p>
  {/await}
</div>
