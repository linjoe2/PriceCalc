<script lang="ts">
  import * as Dialog from "$lib/components/ui/dialog";
  import { createEventDispatcher } from 'svelte';
  import { Storage } from "appwrite";
  import { client } from "$lib/appwrite"; // Ensure you have the Appwrite client imported


  const storage = new Storage(client); // Create a storage instance

  const dispatch = createEventDispatcher();
  
  export let category: string;
  export let uploadedImages: { file: File; preview: string; id: string; category: string }[] = [];
  let selectedImage: string | null = null;

  let isDialogOpen = false;

  function handleFileUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    const files = input.files;

    if (!files) return;

    // Create preview URLs for each file
    Array.from(files).forEach(async file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          uploadedImages = [...uploadedImages, {
            file,
            preview: e.target?.result as string,
            id: file.name, // Store the file name or the actual fileId returned from upload
            category: category
          }];
          dispatch('upload', { file }); // Dispatch an event for the parent component
        };
        reader.readAsDataURL(file);
        
        // Upload the image to Appwrite
        const fileId = await uploadImageToAppwrite(file); // Capture the fileId returned from upload
        // Update uploadedImages with the fileId
        uploadedImages = uploadedImages.map(image => 
          image.file.name === file.name ? { ...image, id: fileId || '' } : image
        );
      }
    });
  }

  async function uploadImageToAppwrite(file: File) {
    try {
      const response = await storage.createFile('67621eca0022af8c411f', 'unique()', file);
      console.log('Image uploaded successfully:', response);
      return response.$id; // Return the fileId from the response
    } catch (error) {
      console.error('Error uploading image:', error);
      return ''; // Return an empty string if there's an error
    }
  }

  async function deleteImageFromAppwrite(fileId: string) {
    try {
      const response = await storage.deleteFile('67621eca0022af8c411f', fileId);
      console.log('Image deleted successfully:', response);
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  }

  function openModal(image: string) {
    selectedImage = image;
    isDialogOpen = true;
  }

  function closeModal() {
    selectedImage = null;
    isDialogOpen = false;
  }
</script>

<div class="border-2 border-dashed border-gray-300 rounded-lg p-6">
  <div class="text-center">
    <label for="fileUpload-{category}" class="cursor-pointer">
      <svg xmlns="http://www.w3.org/2000/svg" class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      <p class="mt-1 text-sm text-gray-600">Klik om foto's te uploaden</p>
      <p class="mt-1 text-xs text-gray-500">PNG, JPG tot 10MB</p>
    </label>
    <input 
      id="fileUpload-{category}"
      type="file"
      multiple
      accept="image/*"
      class="hidden"
      on:change={handleFileUpload}
    />
  </div>

  {#if uploadedImages.length > 0}
    <div class="mt-4 grid grid-cols-4 sm:grid-cols-6 gap-2">
      {#each uploadedImages as image, index}
        <div class="relative group">
          <img 
            src={image.preview} 
            alt="Preview" 
            class="w-16 h-16 object-cover rounded-lg cursor-pointer"
            on:click={() => openModal(image.preview)}
          />
          <button
            class="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            on:click={async () => {
              await deleteImageFromAppwrite(image.id);
              uploadedImages = uploadedImages.filter((_, i) => i !== index);
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      {/each}
    </div>
  {/if}
</div> 

<Dialog.Root bind:open={isDialogOpen}>
  <Dialog.Trigger style="display: none;">Open</Dialog.Trigger>
  <Dialog.Content on:click={closeModal}>
    <Dialog.Header>
      <Dialog.Title>Image Preview</Dialog.Title>
      <Dialog.Description>
        Click outside the image to close the preview.
      </Dialog.Description>
    </Dialog.Header>
    {#if selectedImage}
      <img src={selectedImage} alt="Enlarged Preview" class="w-full h-auto" />
    {/if}
  </Dialog.Content>
</Dialog.Root> 