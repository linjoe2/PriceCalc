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
      console.log(response.text());
    } catch (error) {
      console.error('Error sending document:', error);
      alert('Error bij het versturen van het document. Probeer het opnieuw.');
    }
  }

  async function sendPDF(url: string) {
        const pdfUrl = await storage.getFileDownload(
            '67a166f6000319210c64',  // bucket ID
            projectData.$id
        );

        // Fetch the file as a Blob
        // const response = await fetch(pdfUrl.toString());
        // const blob = await response.blob();
        //  url = window.URL.createObjectURL(blob);

        // Create a temporary link for PDF download
        const link = document.createElement('a');
        link.href = url;
        link.download = `O-${projectData.projectNumber} ${projectData.adress || projectData.client.adress + " "+  projectData.client.postcode + " "+ projectData.client.woonplaats}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
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
        
        const mailUrl= `mailto:${projectData.client.email||''};${projectData.client.subcontractors?.email||''}?subject=${encodedSubject}&body=${encodedBody}&cc=j.fenenga@jhfbouw.com`;
        
        // Create a temporary link for email
        const mailLink = document.createElement('a');
        mailLink.href = mailUrl;
        mailLink.click();
        
        console.log(mailUrl);
    }
</script>

<button
  on:click={sendWithDocumenso}
  class="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
>
  Verstuur offerte
</button> 