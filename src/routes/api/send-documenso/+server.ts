import { json } from '@sveltejs/kit';
import { Storage, ID, Client } from 'node-appwrite';

import { APPWRITE_API_KEY } from '$env/static/private';
import { VITE_DOCUMENSO_API_KEY } from '$env/static/private';

const DOCUMENSO_BASE_URL = "https://sign.toekomst.org/api/v1";

export async function POST({ request }) {
  try {
    const { projectData } = await request.json();
    console.log(projectData);
    // Initialize Appwrite
    const client = new Client();
    client.setEndpoint('https://write.toekomst.org/v1');
    client.setProject('6735e5330020a49e88c4');
    client.setKey(APPWRITE_API_KEY);
    const storage = new Storage(client);

    // Get PDF from Appwrite storage
    const pdfFile = await storage.getFileDownload(
      '67a166f6000319210c64',  // bucket ID
      projectData.$id
    );
    console.log(pdfFile);

    // Convert ArrayBuffer to Blob
    const pdfBlob = new Blob([pdfFile], { type: 'application/pdf' });

    console.log(pdfBlob);
    // Create document in Documenso
    const createDocumentResponse = await fetch(`https://sign.toekomst.org/api/v1/documents`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${VITE_DOCUMENSO_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: `Offerte O-${projectData.projectNumber}`,
        externalId: projectData.$id,
        recipients: [
          {
            email: projectData.client.email,
            name: projectData.client.name,
            role: "SIGNER",
            // signingOrder: null
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
       //  timezone: "Europe/Amsterdam",
       //  dateFormat: "yyyy-MM-dd HH:mm",
     //    language: "en",
        //  subject: `Offerte O-${projectData.projectNumber}`,
        //  message: "Hierbij ontvangt u de offerte. Graag deze digitaal ondertekenen.",
        //   cc: [
        //     "info@jhfbouw.com",
        //     "administratie@jhfbouw.com",
        //     "j.fenenga@jhfbouw.com"
        //   ],
        }
      })
    });

    if (!createDocumentResponse.ok) {
      console.log(createDocumentResponse);
      throw new Error(`Failed to create document: ${createDocumentResponse.status}`);
    }

    const documentData = await createDocumentResponse.json();
    console.log(documentData);

    // Upload the PDF
    const response = await fetch(documentData.uploadUrl, {
      method: "PUT",
      body: pdfBlob,
      headers: {
        "Content-Type": "application/pdf",
        
        //'Authorization': `Bearer ${VITE_DOCUMENSO_API_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Upload failed with status: ${response.status}`);
    }

    return json({ success: true });
  } catch (error) {
    console.error('Error sending document:', error);
    return json({ error: 'Failed to send document' }, { status: 500 });
  }
}