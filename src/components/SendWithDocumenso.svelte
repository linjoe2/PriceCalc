<script lang="ts">
  import type { Project } from '$lib/types';
  import { Databases, Storage } from 'appwrite';
  import { client } from '$lib/appwrite';
  export let projectData: Project;

  const databases = new Databases(client);
  const databaseId = 'PriceCalc'; // Your database ID
  const projectsCollectionId = '67362a9400133ceb48ac'; // Your collection ID
  const storage = new Storage(client);

  async function sendWithDocumenso() {
    if(projectData.documenso !== null) {
      alert('Document al verstuurd');
      // open the documenso link
      window.open(projectData.documenso, '_blank');
      return;
    }
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

      const data = await response.json();

      const documensoId = data.id;
      const signUrl = data.url;

      projectData.signurl = signUrl;
      projectData.documenso = `https://sign.toekomst.org/t/jhf-bouw/documents/${documensoId}`;

      sendPDF(projectData.signurl || '');
      updateProjectStatus();
      // alert('Document succesvol verstuurd!');
      // Save the updated project data
      console.log(data);
    } catch (error) {
      console.error('Error sending document:', error);
      alert('Error bij het versturen van het document. Probeer het opnieuw.');
    }
  }

  async function updateProjectStatus() { 
    try {
      await databases.updateDocument(databaseId, projectsCollectionId, projectData.$id, { documenso: projectData.documenso, signurl: projectData.signurl });
      console.log('Project status updated successfully');
    } catch (error) {
      console.error('Error updating project status:', error);
    }
  }


  async function sendPDF(url: string) {
        const pdfUrl = await storage.getFileDownload(
            '67a166f6000319210c64',  // bucket ID
            projectData.$id
        );

        // Open the PDF in a new browser tab
        window.open(pdfUrl.toString() + "&nocache=" + new Date().getTime(), '_blank');
        // console.log(pdfUrl.toString());
        
        console.log(projectData);
        const subject = `O-${projectData.projectNumber} ${projectData.adress || projectData.client.adress + " "+  projectData.client.postcode + " "+ projectData.client.woonplaats}`;
        const body = `Beste ${projectData.client.name},

Hartelijk dank voor uw offerte aanvraag, met genoegen bieden wij u vrijblijvend onze offerte aan. Heeft u vragen of opmerkingen naar aanleiding van onze aanbieding, neem dan gerust contact met ons op.
Indien u gebruik wenst te maken van onze offerte, verzoeken wij u vriendelijk het akkoord te verstrekken door eenvoudigweg te ondertekenen via deze link:

${url}

Vertrouwende u voldoende te hebben geïnformeerd.
 

Met vriendelijke groet,
 
Aaron van de Worp | Projectleider
06 - 16 433 466

JHF Bouw BV – Dakdekkers
Dukdalfweg 16
1041 BD Amsterdam



`;

        const encodedSubject = encodeURIComponent(subject);
        const encodedBody = encodeURIComponent(body);
        
        const mailUrl= `mailto:${projectData.client?.email || ''};${projectData.client?.subcontractors?.email || ''}?subject=${encodedSubject}&body=${encodedBody}&cc=j.fenenga@jhfbouw.com`;
        
        // Create a temporary link for email
        const mailLink = document.createElement('a');
        mailLink.href = mailUrl;
        // mailLink.target = '_blank';
        mailLink.click();
        
        console.log(mailUrl);
    }
</script>

{#if projectData.documenso === null}
<button
  on:click={sendWithDocumenso}
  class="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
>
  Verstuur offerte
</button> 
{:else}
<a
  href={projectData.documenso}
  target="_blank"
  class="w-full sm:w-auto align-center text-center inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
>
  Bekijk ondertekening
</a>
{/if}