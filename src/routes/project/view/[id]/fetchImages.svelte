<script lang="ts">
  import { onMount } from 'svelte';
  import { Storage } from "appwrite";
  import { client } from "$lib/appwrite"; // Adjust the import path as necessary
  import * as Dialog from "$lib/components/ui/dialog";
  import type { UploadedImage } from '$lib/types';
  // export let imageIds: string[] = [];
  export let bucketId: string = '67621eca0022af8c411f';

  export let uploadedImages: UploadedImage[] = [];
  export let selectedImage: UploadedImage | null = null;

  let isDialogOpen = false; // Add a state variable to control dialog open state

  function openDialog(image: UploadedImage) {
    selectedImage = image;
    isDialogOpen = true; // Set dialog open state to true
    console.log(selectedImage, isDialogOpen);
  }

  // Update the type for groupedImages
  let groupedImages: Record<string, UploadedImage[]> = {};

  onMount(async () => {
    const storage = new Storage(client);
    console.log(uploadedImages);
    
    if (uploadedImages.length > 0) {
      const fetchedImages = await Promise.all(uploadedImages.map(async (image) => {
        try {
          const parsedImage = typeof image === 'string' ? JSON.parse(image) : image;
          const file = await storage.getFilePreview(bucketId, parsedImage.id);
          return { 
            category: parsedImage.category, 
            url: file.toString(),
            id: parsedImage.id 
          } as UploadedImage;
        } catch (error) {
          console.error(`Error fetching image:`, error);
          return null;
        }
      }));
      uploadedImages = fetchedImages.filter((image): image is UploadedImage => image !== null);
      console.log(uploadedImages);
    } else {
      console.warn('No image IDs provided to load images.');
    }

    // Group images by category after fetching
    groupedImages = uploadedImages.reduce((acc: Record<string, UploadedImage[]>, image: UploadedImage) => {
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
          <div
            role="button"
            tabindex="0"
            on:click|preventDefault={() => openDialog(image)}
            on:keydown={(e) => e.key === 'Enter' && openDialog(image)}
          >
            <img src={image.url} alt={image.category} class="uploaded-image" />
          </div>
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
        <img src={selectedImage.url} alt={selectedImage.category} class="dialog-image" />
        <button 
          class="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
          on:click={() => window.open(selectedImage?.url, '_blank')}
        >
          Open in Tab
        </button>
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