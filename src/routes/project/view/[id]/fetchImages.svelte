<script lang="ts">
  import { onMount } from 'svelte';
  import { Storage } from "appwrite";
  import { client } from "$lib/appwrite"; // Adjust the import path as necessary
  import * as Dialog from "$lib/components/ui/dialog";

  export let imageIds: string[] = [];
  export let bucketId: string = '67621eca0022af8c411f';

  export let uploadedImages: { id: string, url: string }[] = [];
  export let selectedImage: { id: string, url: string } | null = null;

  let isDialogOpen = false; // Add a state variable to control dialog open state

  function openDialog(image) {
    selectedImage = image;
    isDialogOpen = true; // Set dialog open state to true
    console.log(selectedImage, isDialogOpen);
  }

  // Group images by category
  let groupedImages = {};

  onMount(async () => {
    const storage = new Storage(client);
    console.log(uploadedImages);
    
    // Check if imageIds is not empty before fetching
    if (uploadedImages.length > 0) {
      // Update existing uploadedImages with URLs based on IDs
      uploadedImages = await Promise.all(uploadedImages.map(async (image) => {
        try {
          image = JSON.parse(image);
          const file = await storage.getFilePreview(bucketId, image.id);
          console.log(file);
          return { category: image.category, url: file }; // Assuming file.href gives the URL
        } catch (error) {
          console.error(`Error fetching image with ID ${image.id}:`, error);
          return null; // Handle error as needed
        }
      }));
      uploadedImages = uploadedImages.filter(image => image !== null); // Filter out null results
      console.log(uploadedImages);
    } else {
      console.warn('No image IDs provided to load images.');
    }

    // Group images by category after fetching
    groupedImages = uploadedImages.reduce((acc, image) => {
      if (!acc[image.category]) {
        acc[image.category] = [];
      }
      acc[image.category].push(image);
      return acc;
    }, {});
  });
</script>

<div class="image-gallery">
  {#if Object.keys(groupedImages).length > 0}
    {#each Object.entries(groupedImages) as [category, images]}
      <div class="category-group">
        <h3>{category}</h3>
        <div class="images-row">
          {#each images as image}
            <img src={image.url} alt="Uploaded Image" class="uploaded-image" on:click={() => openDialog(image)} />
          {/each}
        </div>
      </div>
    {/each}
  {:else}
    <p>No images uploaded.</p>
  {/if}
</div>

<Dialog.Root bind:open={isDialogOpen} on:close={() => isDialogOpen = false}>
  {#if selectedImage}
    <Dialog.Content>
      <Dialog.Header>
        <Dialog.Title>{selectedImage.category}</Dialog.Title>
        <img src={selectedImage.url} alt="Selected Image" class="dialog-image" />
      </Dialog.Header>
    </Dialog.Content>
  {/if}
</Dialog.Root>

<style>
  .image-gallery {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  .category-group {
    margin-bottom: 20px;
  }
  .images-row {
    display: flex;
    gap: 10px; /* Adjust gap between images */
  }
  .uploaded-image {
    width: 100px;
    height: 100px;
    object-fit: cover;
    border-radius: 8px;
    cursor: pointer;
  }
  .dialog-image {
    width: 100%;
    height: auto;
    object-fit: contain;
  }
</style>