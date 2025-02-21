import { json, text } from '@sveltejs/kit';
import PDFDocument from 'pdfkit';
import { Storage, ID, Client } from 'node-appwrite';
import { APPWRITE_API_KEY } from '$env/static/private';

import path from 'path';
import { fileURLToPath } from 'url';
import type trainTrack from 'lucide-svelte/icons/train-track';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TimesNewRoman = path.join(__dirname, !import.meta.env.DEV ? '../../../static/fonts/Times-New-Roman.ttf' : '../../../../static/fonts/Times-New-Roman.ttf');
const TimesNewRomanBold = path.join(__dirname, !import.meta.env.DEV ? '../../../static/fonts/Times-New-Roman-Bold.ttf' : '../../../../static/fonts/Times-New-Roman-Bold.ttf');
const logo = path.join(__dirname, !import.meta.env.DEV ? '../../../static/jhfbouw-logo.png' : '../../../../static/jhfbouw-logo.png');
console.log(__dirname);
console.log(TimesNewRoman);
console.log(TimesNewRomanBold);

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
            font: TimesNewRoman,
            bufferPages: true
        });
        const chunks: Buffer[] = [];

        // Collect PDF data chunks
        doc.on('data', chunk => chunks.push(chunk));

        // Promise to handle PDF generation completion
        const pdfComplete = new Promise((resolve) => {
            doc.on('end', () => resolve(Buffer.concat(chunks)));
        });

        // Add logo in top right corner
        try {
            doc.image(logo, 325, 50, {
                fit: [200, 200],  // Adjust size as needed
                align: 'right'
            });
        } catch (error) {
            console.error('Error loading logo:', error);
            // Continue without logo if it fails to load
        }
        doc.fontSize(14)
        .font(TimesNewRomanBold)
        .moveDown(0.5)
        .text('JHF Bouw B.V.', 400, doc.y, { align: 'right'})
        .text('Dukdalfweg 16', 400, doc.y, { align: 'right'})
        .text('1041 BD Amsterdam', 400, doc.y, { align: 'right'})
        .moveDown(0.5)
        .text('Tel: 020-2136082', 400, doc.y, { align: 'right'})
        .text('info@jhfbouw.nl', 400, doc.y, { align: 'right'})
        .moveDown(2);
        


        // draw bounding rectangle
        // doc.rect(100, 0, 410, 50).stroke();
        // doc.rect(100, 100, 200, 50).stroke();

        
        //

        // Add styled content to PDF
        doc.font(TimesNewRomanBold)
           .fontSize(32)
           .text('Offerte', 60, 50)
           .moveDown(0.5);


        // Add company logo placeholder line
        // Add project details with styling
        doc.font(TimesNewRoman)
           .fontSize(14);
        
        // Client information section
        const startY = doc.y;
        
        // Left column - Client details
        doc
        .font(TimesNewRomanBold)
        .text('Adres:', 60, startY)
        .font(TimesNewRoman)
           .fontSize(12)
        
        const client = projectData.client;
        // if subcontractor
        if(client.subcontractors !== null){
            projectData.client.businessname = client.subcontractors.businessname;
            doc.text(`${client.subcontractors.businessname}`, 60)
            doc.text(`${client.subcontractors.address}`, 60)
            doc.text(`Email: ${client.subcontractors.email}`, 60)
            doc.text(`Tel: ${client.subcontractors.phone || 'N/B'}`, 60)
            doc.font(TimesNewRomanBold)
            doc.text("betreft:")
            doc.font(TimesNewRoman)
            doc.text(`${client.name} ${client.lastname}`)
            doc.text(`${client.adress} ${client.huisnummer}, ${client.postcode} ${client.woonplaats}`)
            doc.moveDown(1);
        }else if(client.businessname === '' || client.businessname === null){
            doc
           .text(`T.a.v. ${client.name} ${client.lastname}`)
           .text(`${client.adress} ${client.huisnummer}`)
           .text(`${client.postcode} ${client.woonplaats}`)
           .text(`Email: ${client.email}`)
           .text(`Tel: ${client.telefoonnummer || 'N/B'}`)
           .moveDown(1);
        } else {
          doc.text(`${client.businessname}`, 60)
           .text(`T.a.v. ${client.name} ${client.lastname}`)
           .text(`${client.adress} ${client.huisnummer}`)
           .text(`${client.postcode} ${client.woonplaats}`)
           .text(`Email: ${client.email}`)
           .text(`Tel: ${client.telefoonnummer || 'N/B'}`)
           .moveDown(1);

       }

        // if BV


        // if Particulier

        doc
            .fontSize(12)
            .font(TimesNewRomanBold)
            .text(`Offertedatum:`)
            .font(TimesNewRoman)
            .text(`${new Date(projectData.createdAt).toLocaleDateString('nl-NL')}`)
           .moveDown(0.5);


        doc.fontSize(12)
           .font(TimesNewRomanBold)
           .text(`Offertenummer:`)
           .font(TimesNewRoman)
           .text(`${projectData.projectNumber}`)
           .moveDown(1.5);

        //boxes top
        doc.rect(50, 50, 250, 250).stroke();
         
        doc.rect(300, 50, 250, 250).stroke();
        
        // Draw table header
        // doc.fontSize(12)
        //    .text('Omschrijving', 50, doc.y, { width: 495, continued: true })
        //    .text('Bedrag', { width: 50, align: 'right' })
        //    .moveDown(0.5);

        // // Draw separator line
        // doc.moveTo(50, doc.y)
        //    .lineTo(545, doc.y)
        //    .stroke()
        //    .moveDown(1);
        doc.y = 310;
        // Add items if available
        const projects = JSON.parse(projectData.projects) || [];
        if (projects.length > 0) {
            projects.forEach(project => {
                if (project.items && project.items.length > 0) {
                    // Add project name as header
                    doc.font(TimesNewRomanBold)
                       .text(project.name, { width: 495 })
                       .moveDown(0.5);

                    // Add project items
                    project.items.forEach(item => {
                        const itemPrice = parseFloat(item.price) * item.quantity;
                        const description = `${item.subcategory} - ${item.type} - ${item.quantity} ${item.unit}`;
                        
                        doc.font(TimesNewRomanBold)
                           .text(description)
                          // Check for tasks in project.tasks that match this item
                        const itemTasks = projectData.tasks.filter(task => 
                            task.subcategory === item.subcategory && 
                            task.type === item.type &&
                            task.category === item.category
                        );

                        itemTasks.forEach(task => {
                            doc.font(TimesNewRoman)
                               .text('* ' + task.description, { width: 450 })
                        });
 doc
 .font(TimesNewRomanBold)
 .text(`Subtotaal materiaal en arbeid: € ${itemPrice.toFixed(2)}`, { align: 'right' })
 .font(TimesNewRoman)
 .moveDown(0.5);
                    });
                    doc.moveDown(0.5);
                   

                }
            });
        } else {
            doc.font(TimesNewRoman)   
               .text('Geen projecten gespecificeerd', { width: 495, align: 'center' })
               .moveDown(0.5);
        }

 
         // Calculate total price from all projects
        const totalPrice = projects.reduce((total, project) => {
            return total + project.items.reduce((projectTotal, item) => {
                return projectTotal + (parseFloat(item.price) * item.quantity);
            }, 0);
        }, 0);


            
        let totalPriceWithTax = totalPrice * 1.21; // 21% BTW


        // Draw total separator line
            doc.moveTo(50, doc.y)
            .lineTo(545, doc.y)
            .stroke()
            .moveDown(0.5);

            doc.text(`Totaal excl. BTW:(*) € ${totalPrice.toFixed(2)}`, 50, doc.y, { align: 'right'})
            console.log(projectData.client.businessname);
            if(projectData.client.businessname === '' || projectData.client.businessname === null){
            doc.text(`BTW: € ${(totalPrice * 0.21).toFixed(2)}`, 50, doc.y, { align: 'right'})
            }else{
            doc.text(`BTW Verlegd: € 0,00`, 50, doc.y, { align: 'right'})
            totalPriceWithTax = totalPrice
            }
            doc.moveTo(350, doc.y)
            .lineTo(545, doc.y)
            .stroke(2)
            doc.text(`Totaal incl. BTW:(*) € ${totalPriceWithTax.toFixed(2)}`, 50, doc.y, { align: 'right'})
            doc.moveDown(0.5);
            doc.moveTo(50, doc.y)
            .lineTo(545, doc.y)
            .stroke()
            .moveDown(1);

        if(projectData.terms !== null ){
            const terms = JSON.parse(projectData.terms);
            doc.fontSize(14)
               .font(TimesNewRomanBold)
               .text('Voorwaarden *:', 50, doc.y)
               .moveDown(0.5)
               .font(TimesNewRoman)
               .fontSize(12)
               .text(` * ${terms.map(term => term.text).join('\n * ' )}`)
               .moveDown(1);
        }


        //if doc.y > 500, add a new page
        console.log('y',doc.y);
        if(doc.y > 600){
            doc.addPage();
            console.log('new page');
            doc.moveTo(50, 50);
        }
 
        // Add payment schedule
        // Define consistent column positions
        const col1 = 50;    // Description
        const col2 = 200;   // Excl. BTW
        const col3 = 275;   // 9% BTW
        const col4 = 350;   // 21% BTW
        const col5 = 425;   // Incl. BTW
        const colWidth = 75;

        // Headers
        let y = doc.y;
        doc.fontSize(11)
           .font(TimesNewRomanBold)
           .fontSize(12)
           .text('Betalingscondities *:', col1, y, { width: 150 })
           .fontSize(11)
           doc.text('Excl. BTW', col2, y, { width: colWidth, align: 'left' })
           if(projectData.client.businessname === '' || projectData.client.businessname === null){
           doc.text('21% BTW', col4, y, { width: colWidth, align: 'left' })
           }else{
           doc.text('BTW Verlegd', col4, y, { width: colWidth, align: 'left' })
           }
           doc.text('Incl. BTW', col5, y, { width: colWidth, align: 'left' })
           .moveDown(0.5);


       // Payment rows
        doc.font(TimesNewRoman);
        const payments = [
            { term: '50% bij opdracht', percentage: 0.5 },
            { term: '45% tijdens werkzaamheden', percentage: 0.45 },
            { term: '5% bij oplevering', percentage: 0.05 }
        ];

        payments.forEach(payment => {
            const baseAmount = totalPrice * payment.percentage;
            const btw21 = baseAmount * 0.21;
            const totalRowAmount = baseAmount + btw21;

             y = doc.y;
            doc.text(payment.term, col1, y, { width: 190 })
               .text(`€ ${baseAmount.toFixed(2)}`, col2, y, { width: colWidth, align: 'left' })
               if(projectData.client.businessname === '' || projectData.client.businessname === null){
               doc.text(`€ ${btw21.toFixed(2)}`, col4, y, { width: colWidth, align: 'left' })
               }else{
               doc.text(`€ 0,00`, col4, y, { width: colWidth, align: 'left' })
               }
               doc.text(`€ ${totalRowAmount.toFixed(2)}`, col5, y, { width: colWidth, align: 'left' })
               .moveDown(0.5);
        });

        // Total row
        y = doc.y;
        doc.moveDown(0.5)
           .font(TimesNewRomanBold)
           .text('Totaal:', col1, y, { width: 190 })
           .text(`€ ${totalPrice.toFixed(2)}`, col2, y, { width: colWidth, align: 'left' })
        //    .text(`€ 0,00`, col3, y, { width: colWidth, align: 'left' })
        if(projectData.client.businessname === '' || projectData.client.businessname === null){
           doc.text(`€ ${(totalPrice * 0.21).toFixed(2)}`, col4, y, { width: colWidth, align: 'left' })
           }else{
           doc.text(`€ 0,00`, col4, y, { width: colWidth, align: 'left' })
           }

           doc.text(`€ ${totalPriceWithTax.toFixed(2)}`, col5, y, { width: colWidth, align: 'left' })
           .moveDown(2);
// move back to left column

        doc.moveTo(50, 100);
        doc.font(TimesNewRoman)
        doc.text('Mocht u nog vragen hebben over deze offerte dan kunt u altijd bellen of mailen.', 50, doc.y )
        .moveDown(1);
        doc.text("Met vriendelijke groet,")
        .moveDown(1);
        doc.text("John Fenenga | Eigenaar")
        doc.text("JHF Bouw B.V.")
        doc.text("06-14805120")
        doc.text("info@jhfbouw.com")
        .moveDown(1);
        // Validity notice at the bottom

const range = doc.bufferedPageRange();

for( let i = range.start; i <  (range.start + range.count); i++) {

  doc.switchToPage(i);
  doc.fontSize(10)
  .font(TimesNewRomanBold)
  .text(`ING: NL12INGB0006160953 | KvK nr: 86043862 | BTW nr: NL863842999B01`, 
            125, 
            doc.page.height - 30, 
            { height : 25, width : 400});

  doc.text(`Offerte ${projectData.projectNumber}`, 
            250, 
            30, 
            { height : 25, width : 100});


}



        // Finalize the PDF
        doc.end();

        // Wait for PDF generation to complete
        const pdfBuffer = await pdfComplete;

        // Save to Appwrite storage
        try {
            const file = new File([pdfBuffer], `offerte-${projectData.projectNumber || projectData.$id}.pdf`, {
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