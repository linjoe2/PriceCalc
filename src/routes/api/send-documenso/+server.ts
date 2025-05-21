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
            signingOrder: 0
            
          },
          // {
          //   email: "info@jhfbouw.com",
          //   name: "JHF Bouw",
          //   role: "CC",
          // },
          // {
          //   email: "administratie@jhfbouw.com",
          //   name: "JHF Bouw Administratie",
          //   role: "CC",
          // },
          // {
          //   email: "j.fenenga@jhfbouw.com",
          //   name: "John Fenenga",
          //   role: "CC",
          // }
        ],
        meta: {
         timezone: "Europe/Amsterdam",
        //  dateFormat: "yyyy-MM-dd HH:mm",
     //    language: "en",
          subject: `Offerte O-${projectData.projectNumber} van JHF Bouw`,
          message: "Hierbij ontvangt u de offerte. Bij akkord graag deze digitaal ondertekenen.",
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

    // Log the document data to see the structure
    console.log('Document data:', JSON.stringify(documentData, null, 2));

    // Extract the recipient ID - ensure it's a number
    const recipientId = documentData.recipients && documentData.recipients.length > 0 
      ? parseInt(documentData.recipients[0].recipientId, 10) 
      : null;
    
    if (!recipientId) {
      throw new Error('No valid recipient ID found in the document data');
    }
    console.log(recipientId);
    // Add fields to the document
    console.log('documentId', documentData.documentId);
    const addFieldsResponse = await fetch(`${DOCUMENSO_BASE_URL}/documents/${documentData.documentId}/fields`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${VITE_DOCUMENSO_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify([
        {
          recipientId: recipientId,
          type: "SIGNATURE",
          pageNumber: 1, // First page
          pageX: 10, // X position on the page
          pageY: 33, // Y position on the page
          pageWidth: 25, // Width of the signature field
          pageHeight: 5, // Height of the signature field,
          // fieldMeta: {
            // label: "Handtekening",
            // required: true
          // }
        },
        // {
        //   recipientId: recipientId,
        //   type: "TEXT",
        //   pageNumber: 1,
        //   pageX: 400,
        //   pageY: 800,
        //   pageWidth: 200,
        //   pageHeight: 50,
        //   fieldMeta: {
        //     label: "Datum",
        //     placeholder: "DD-MM-YYYY",
        //     required: true,
        //     type: "text"
        //   }
        // }
      ])
    });

    if (!addFieldsResponse.ok) {
      const errorText = await addFieldsResponse.text();
      console.error('Failed to add fields:', errorText);
      throw new Error(`Failed to add fields: ${addFieldsResponse.status}`);
    }

    // Send the document to recipients
    const sendDocumentResponse = await fetch(`${DOCUMENSO_BASE_URL}/documents/${documentData.documentId}/send`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${VITE_DOCUMENSO_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sendEmail: false,
        sendCompletionEmails: false
      })
    });

    if (!sendDocumentResponse.ok) {
      const errorText = await sendDocumentResponse.text();
      console.error('Failed to send document:', errorText);
      throw new Error(`Failed to send document: ${sendDocumentResponse.status}`);
    }
    // console.log(sendDocumentResponse);
    return json({ success: true, url: documentData.recipients[0].signingUrl });
  } catch (error) {
    console.error('Error sending document:', error);
    return json({ error: 'Failed to send document' }, { status: 500 });
  }
}