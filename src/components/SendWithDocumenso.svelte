<script lang="ts">
  import type { Project } from '$lib/types';

  export let projectData: Project;

  async function sendWithDocumenso() {
    try {
      const response = await fetch('/api/send-documenso', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ projectData }),
      });

      if (!response.ok) {
        throw new Error('Document niet succesvol verstuurd');
      }

      alert('Document succesvol verstuurd!');
    } catch (error) {
      console.error('Error sending document:', error);
      alert('Error bij het versturen van het document. Probeer het opnieuw.');
    }
  }
</script>

<button
  on:click={sendWithDocumenso}
  class="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
>
  Verstuur ter ondertekening
</button> 