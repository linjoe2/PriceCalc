import { json } from '@sveltejs/kit';
import PDFDocument from 'pdfkit';
import { Storage, ID, Client } from 'node-appwrite';
import { APPWRITE_API_KEY } from '$env/static/private';

import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const helvetica = path.join(__dirname, process.env.NODE_ENV === 'production' ? '../../../static/fonts/Helvetica.ttf' : '../../../../static/fonts/Helvetica.ttf');
const helveticaBold = path.join(__dirname, process.env.NODE_ENV === 'production' ? '../../../static/fonts/Helvetica-Bold.ttf' : '../../../../static/fonts/Helvetica-Bold.ttf');

console.log(__dirname);
console.log(helvetica);
console.log(helveticaBold);

export async function POST({ request }) {

    const client = new Client();
    client.setEndpoint('https://write.toekomst.org/v1');
    client.setProject('6735e5330020a49e88c4');
    client.setKey(APPWRITE_API_KEY);
    // client.setSelfSigned(true); // Use only on dev mode with a self-signed SSL cert
    const storage = new Storage(client);
    
    try {
        const projectData = await request.json();
        
        // Create a new PDF document
        const doc = new PDFDocument({
            size: 'A4',
            margin: 50,
            font: helvetica
        });
        const chunks: Buffer[] = [];

        // Collect PDF data chunks
        doc.on('data', chunk => chunks.push(chunk));

        // Promise to handle PDF generation completion
        const pdfComplete = new Promise((resolve) => {
            doc.on('end', () => resolve(Buffer.concat(chunks)));
        });

        // // Fetch and add the logo
        // try {
        //     const logoResponse = await fetch('https://jhfbouw.nl/wp-content/uploads/2024/04/jhfbouw-logo.svg');
        //     const logoBuffer = await logoResponse.arrayBuffer();
        //     doc.image(Buffer.from(logoBuffer), 50, 50, { width: 200 })
        //        .moveDown(2);
        // } catch (error) {
        //     console.error('Error loading logo:', error);
        //     // Continue without logo if it fails to load
        // }

        // Add styled content to PDF
        doc.font(helveticaBold)
           .fontSize(32)
           .text('Projectofferte', { align: 'center' })
           .moveDown(0.5);

        doc
            .fontSize(12)
        .text(`Datum: ${new Date(projectData.createdAt).toLocaleDateString('nl-NL')}`)
           .moveDown(0.5);

        doc.fontSize(12)
           .text(`Offerte nummer: ${projectData.$id}`)
           .moveDown(0.5);

        // Add company logo placeholder line
        doc.moveTo(50, doc.y)
           .lineTo(545, doc.y)
           .stroke()
           .moveDown(0.5);

        // Add project details with styling
        doc.font(helvetica)
           .fontSize(14);
        
        // Client information section
        const startY = doc.y;
        
        // Left column - Client details
        doc.text('Klantgegevens:', 50, startY)
           .fontSize(12)
           .moveDown(0.5);
        
        const client = projectData.client;
        doc.text(`${client.businessname || ''}`, 50)
           .text(`${client.name} ${client.lastname}`)
           .text(`${client.adress} ${client.huisnummer}`)
           .text(`${client.postcode} ${client.woonplaats}`)
           .text(`Email: ${client.email}`)
           .text(`Tel: ${client.telefoonnummer || 'N/B'}`)
           .text(`Bouwjaar pand: ${client.bouwjaar}`)
           .text(`Oppervlakte: ${client.oppervlakte} m²`)
           .moveDown(2);

        // Right column - Company details
        doc.fontSize(14)
           .text('Bedrijfsgegevens:', 300, startY)
           .fontSize(12)
           .moveDown(0.5)
           .text('JHF Bouw')
           .text('Dukdalfweg 16')
           .text('1041 BD Amsterdam')
           .text('Email: info@jhfbouw.nl')
           .text('Tel: 020-2136082')
           .text('KvK: 86043862')

           .moveDown(2);

        // // Project details
        // doc.fontSize(14)
        //    .font('Helvetica-Bold')
        //    .text('Projectspecificaties', { underline: true })
        //    .moveDown();

        // doc.fontSize(12)
        //    .font('Helvetica')
        //    .text('Status: ' + (projectData.status || 'In behandeling'))
        //    .moveDown(2);

        // Add pricing table with better formatting
        // doc.font('Helvetica-Bold')
        //    .fontSize(14)
        //    .text('Kostenoverzicht', { underline: true, align: 'center' })
        //    .moveDown(1);
        
        if(projectData.opmerkingen !== null ){
        doc.moveDown(2)
           .fontSize(14)
           .text('Opmerkingen',50, doc.y)
           .fontSize(12)
           .text(`${projectData.opmerkingen}`)
           .moveDown(1);
        }

        // Draw table header
        doc.moveDown(1)
            .fontSize(12)
           .text('Omschrijving', 50, doc.y, { width: 495, continued: true })
           .text('Bedrag', { width: 50, align: 'right' })
           .moveDown(0.5);

        // Draw separator line
        doc.moveTo(50, doc.y)
           .lineTo(545, doc.y)
           .stroke()
           .moveDown(1);

        // Add items if available
        const projects = JSON.parse(projectData.projects) || [];
        if (projects.length > 0) {
            projects.forEach(project => {
                if (project.items && project.items.length > 0) {
                    // Add project name as header
                    doc.font(helveticaBold)
                       .text(project.name, { width: 495 })
                       .moveDown(0.5);

                    // Add project items
                    project.items.forEach(item => {
                        const itemPrice = parseFloat(item.price) * item.quantity;
                        const description = `${item.subcategory} - ${item.type}\nAantal: ${item.quantity} ${item.unit}`;
                        
                        doc.font(helvetica)
                           .text(description, { width: 495, continued: true })
                           .text(`€ ${itemPrice.toFixed(2)}`, { width: 50, align: 'right' })
                           .moveDown(0.5);
                    });
                    doc.moveDown(0.5);
                }
            });
        } else {
            doc.font(helvetica)   
               .text('Geen projecten gespecificeerd', { width: 495, align: 'center' })
               .moveDown(0.5);
        }

        // Draw total separator line
        doc.moveTo(50, doc.y)
           .lineTo(545, doc.y)
           .stroke()
           .moveDown(1);

        // Calculate total price from all projects
        const totalPrice = projects.reduce((total, project) => {
            return total + project.items.reduce((projectTotal, item) => {
                return projectTotal + (parseFloat(item.price) * item.quantity);
            }, 0);
        }, 0);

        const totalPriceWithTax = totalPrice * 1.21; // 21% BTW

        // Add total with better formatting
        doc.font(helveticaBold)
           .text('Subtotaal: ', { continued: true })
           .text(`€ ${totalPrice.toFixed(2)}`, { align: 'right' })
           .moveDown(0.5)
           .text('BTW (21%): ', { continued: true })
           .text(`€ ${(totalPriceWithTax - totalPrice).toFixed(2)}`, { align: 'right' })
           .moveDown(0.5)
           .text('Totaalbedrag (incl. BTW): ', { continued: true })
           .text(`€ ${totalPriceWithTax.toFixed(2)}`, { align: 'right' })
           .moveDown(2);

  

        // Validity notice at the bottom
        doc.moveDown(2)
           .text('Deze offerte is 30 dagen geldig vanaf de afgiftedatum.', { align: 'center' });

        // Finalize the PDF
        doc.end();

        // Wait for PDF generation to complete
        const pdfBuffer = await pdfComplete;

        // Save to Appwrite storage
        try {
            const file = new File([pdfBuffer], `offerte-${projectData.$id}.pdf`, {
                type: 'application/pdf'
            });

            // Check if a file with the same projectData ID already exists
            try {
                const existingFile = await storage.getFile(
                    '67a166f6000319210c64',  // Your bucket ID
                    projectData.$id
                );

                // If the file exists, delete it
                if (existingFile) {
                    await storage.deleteFile(
                        '67a166f6000319210c64',  // Your bucket ID
                        projectData.$id
                    );
                }
            } catch (error) {
                // If the error is not a "file not found" error, log it
                if (error.code !== 404) {
                    console.error('Error checking for existing file:', error);
                }
            }

            const result = await storage.createFile(
                '67a166f6000319210c64',  // Your bucket ID
                projectData.$id,
                file
            );


            return json(result, { status: 200 });

        } catch (storageError) {
            console.error('Appwrite storage error:', storageError);
            return json({ error: 'Failed to save PDF to storage' }, { status: 500 });
        }

    } catch (error) {
        console.error('PDF generation error:', error);
        return json({ error: 'Failed to generate PDF' }, { status: 500 });
    }
} 