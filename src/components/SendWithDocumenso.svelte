<script lang="ts">
  import { Documenso } from "@documenso/sdk-typescript";
  import type { Project } from '$lib/types';
  import { Storage } from 'appwrite';
  import { client } from '$lib/appwrite';

  export let projectData: Project;
  export let pdfBlob: Blob | null = null;

  const documenso = new Documenso({
    apiKey: import.meta.env.VITE_DOCUMENSO_API_KEY ?? "",
    serverURL: "https://" + import.meta.env.VITE_DOCUMENSO_URL + "/api/v1",

  });

  const storage = new Storage(client);

  async function sendWithDocumenso() {
    try {
      // Get PDF from Appwrite storage
      const pdfUrl = await storage.getFileView(
        '67a166f6000319210c64',  // bucket ID
        projectData.$id
      );

      const pdfResponse = await fetch(pdfUrl, {
        credentials: 'include'
      });
      if (!pdfResponse.ok) {
        throw new Error('Failed to fetch PDF from Appwrite');
      }
      const pdfBlob = await pdfResponse.blob();

      // Create document in Documenso
      const createDocumentResponse = await documenso.documents.createV0({
        title: `Offerte O-${projectData.projectNumber}`,
        recipients: [
          {
            email: projectData.client.email,
            name: `${projectData.client.name} ${projectData.client.lastname}`,
            role: "SIGNER",
            fields: [
              {
                type: "SIGNATURE",
                pageNumber: 1,
                pageX: 10,
                pageY: 10,
                width: 10,
                height: 10,
              }
            ],
          }
        ],
        meta: {
          timezone: "Europe/Amsterdam",
          dateFormat: "yyyy-MM-dd HH:mm",
          language: "en",
          subject: `Offerte O-${projectData.projectNumber}`,
          message: "Hierbij ontvangt u de offerte. Graag deze digitaal ondertekenen.",
          cc: [
            "info@jhfbouw.com",
            "administratie@jhfbouw.com",
            "j.fenenga@jhfbouw.com"
          ],
        },
      });

      const { uploadUrl } = createDocumentResponse;

      // Upload the PDF
      const response = await fetch(uploadUrl, {
        method: "PUT",
        body: pdfBlob,
        // credentials: 'include',
        headers: {
          'Access-Control-Allow-Origin': '*',
          "Content-Type": "application/octet-stream",
        },
      });

      if (!response.ok) {
        throw new Error(`Upload failed with status: ${response.status}`);
      }

      alert('Document successfully sent for signing!');
    } catch (error) {
      console.error('Error sending document:', error);
      alert('Error sending document. Please try again.');
    }
  }
</script>

<button
  on:click={sendWithDocumenso}
  class="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
>
  Verstuur ter ondertekening
</button> 