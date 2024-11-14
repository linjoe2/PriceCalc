<script>
  import { onMount } from 'svelte';
  let offertes = [];

  // Function to fetch offertes from Appwrite
  async function fetchOffertes() {
    // const response = await fetch('YOUR_APPWRITE_ENDPOINT'); // Replace with your Appwrite endpoint
    // offertes = await response.json();
  }

  onMount(() => {
    fetchOffertes();
  });
</script>

  <h1>Projects</h1>
  <a href="/project/new" ><button >+ Nieuw</button></a>
  
  <ul>
    {#each offertes as offerte}
      <li>{offerte.title}</li> <!-- Adjust according to your offerte structure -->
    {/each}
  </ul>
