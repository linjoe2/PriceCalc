<script>
    import { Storage } from 'appwrite';
    import { client } from '$lib/appwrite';
    export let projectData;
    const storage = new Storage(client);

    async function showPDF() {


        const pdfUrl = await storage.getFileView(
            '67a166f6000319210c64',  // bucket ID
            projectData.$id
        );

        window.open(pdfUrl.toString(), '_blank');

    }

    async function sendPDF() {
        const pdfUrl = await storage.getFileView(
            '67a166f6000319210c64',  // bucket ID
            projectData.$id
        );
        
        const subject = "Offerte staat klaar";
        const body = `Beste ${projectData.client.name} ${projectData.client.lastname},

Hierbij stuur ik u de offerte voor het project.

Om het project te ondertekenen en starten kunt u deze link volgen: ${pdfUrl}

`;

        const encodedSubject = encodeURIComponent(subject);
        const encodedBody = encodeURIComponent(body);
        
        window.location.href = `mailto:${projectData.client.email}?subject=${encodedSubject}&body=${encodedBody}`;
      }
</script>

<button class="show-pdf-button border-2 border-black text-black px-4 py-2 rounded" on:click={showPDF}>Toon PDF</button>
<button class="show-pdf-button border-2 border-black text-black px-4 py-2 rounded" on:click={sendPDF}>Verstuur PDF</button>