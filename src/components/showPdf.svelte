<script lang="ts">
    import { Storage } from 'appwrite';
    import { client } from '$lib/appwrite';
    export let projectData;
    const storage = new Storage(client);

    async function showPDF() {


        const pdfUrl = await storage.getFileView(
            '67a166f6000319210c64',  // bucket ID
            projectData.$id
        );

        window.open(pdfUrl.toString() + "&nocache=" + new Date().getTime(), '_blank');

    }

    async function sendPDF() {
        const pdfUrl = await storage.getFileDownload(
            '67a166f6000319210c64',  // bucket ID
            projectData.$id
        );

        // Fetch the file as a blob
        const response = await fetch(pdfUrl.toString(), { credentials: 'include' });
        const blob = await response.blob();

        // Create a temporary link to trigger the download
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `O-${projectData.projectNumber} ${projectData.adress || projectData.client.adress + " "+  projectData.client.postcode + " "+ projectData.client.woonplaats}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Clean up the object URL
        URL.revokeObjectURL(link.href);

        const subject = `O-${projectData.projectNumber} ${projectData.adress || projectData.client.adress + " "+  projectData.client.postcode + " "+ projectData.client.woonplaats}`;
        const body = `Beste ${projectData.client.name},

Hartelijk dank voor uw offerte aanvraag, met genoegen bieden wij u vrijblijvend onze offerte aan. Heeft u vragen of opmerkingen naar aanleiding van onze aanbieding, neem dan gerust contact met ons op.
Indien u gebruik wenst te maken van onze offerte, verzoeken wij u vriendelijk het akkoord te verstrekken door eenvoudigweg te ondertekenen via onderstaande link:

${projectData.signurl}





`;

        const encodedSubject = encodeURIComponent(subject);
        const encodedBody = encodeURIComponent(body);
        
        const mailUrl= `mailto:${projectData.client?.email};${projectData.client?.subcontractors?.email}?subject=${encodedSubject}&body=${encodedBody}&cc=j.fenenga@jhfbouw.com`;
        window.open(mailUrl, '_blank');
       
        console.log(mailUrl);
    }
</script>

<button class="show-pdf-button border-2 border-black text-black px-4 py-2 rounded" on:click={showPDF}>Toon PDF</button>
{#if projectData.signurl !== null}
<button class="show-pdf-button border-2 border-black text-black px-4 py-2 rounded" on:click={sendPDF}>Verstuur nogmaals</button>
{/if}