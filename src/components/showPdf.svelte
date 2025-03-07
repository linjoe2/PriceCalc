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

        window.open(pdfUrl.toString() + "&nocache=" + new Date().getTime(), '_blank');

    }

    async function sendPDF() {
        const pdfUrl = await storage.getFileDownload(
            '67a166f6000319210c64',  // bucket ID
            projectData.$id
        );
        
        window.open(pdfUrl.toString(), '_blank');
        const subject = "Offerte staat klaar";
        const body = `Beste ${projectData.client.name} ${projectData.client.lastname} 


Hierbij ontvangt u onze offerte. 
Als u gebruik wenst te maken van onze offerte willen wij u vriendelijk verzoeken eenvoudigweg met "akkoord" te reageren op deze e-mail. 
Wij willen u vragen om de adressering op de offerte goed na te kijken, dit zal tevens als facturatieadres gebruikt worden. 
Indien het adres niet juist is, gelieve dit z.s.m. per e-mail doorgeven zodat de gegevens aangepast kunnen worden. 
De offerte is 30 dagen geldig, hierna zal de offerte komen te vervallen. 
 
Vertrouwende u zo voldoende te hebben geïnformeerd.
 

Met vriendelijke groet,
 
John Fenenga
0614805120


JHF Bouw BV – Dakdekkers
Dukdalfweg 16
1041 BD Amsterdam



`;

        const encodedSubject = encodeURIComponent(subject);
        const encodedBody = encodeURIComponent(body);
        
        const mailUrl= `mailto:${projectData.client.email || ''};${projectData.client.subcontractors?.email || ''}?subject=${encodedSubject}&body=${encodedBody}`;
        window.open(mailUrl, '_blank');

      }
</script>

<button class="show-pdf-button border-2 border-black text-black px-4 py-2 rounded" on:click={showPDF}>Toon PDF</button>
<button class="show-pdf-button border-2 border-black text-black px-4 py-2 rounded" on:click={sendPDF}>Verstuur PDF</button>