import { json } from '@sveltejs/kit';
import PDFDocument from 'pdfkit';

export async function POST({ request }) {
    try {
        const projectData = await request.json();
        
        // Create a new PDF document
        const doc = new PDFDocument({
            size: 'A4',
            margin: 50
        });
        const chunks: Buffer[] = [];

        // Collect PDF data chunks
        doc.on('data', chunk => chunks.push(chunk));

        // Promise to handle PDF generation completion
        const pdfComplete = new Promise((resolve) => {
            doc.on('end', () => resolve(Buffer.concat(chunks)));
        });

        // Add styled content to PDF
        doc.font('Helvetica-Bold')
           .fontSize(28)
           .text('Project Quote', { align: 'center' })
           .moveDown(2);

        // Add project details with styling
        doc.font('Helvetica')
           .fontSize(14)
           .text(`Client: ${projectData.clientName || 'N/A'}`, { continued: true })
           .text(`Date: ${new Date().toLocaleDateString()}`, { align: 'right' })
           .moveDown();

        // Add quote details
        doc.fontSize(12)
           .text(`Project Title: ${projectData.title || 'N/A'}`)
           .moveDown()
           .text(`Description: ${projectData.description || 'N/A'}`, {
               width: 500,
               align: 'justify'
           })
           .moveDown(2);

        // Add pricing table
        doc.font('Helvetica-Bold')
           .text('Pricing Breakdown', { underline: true })
           .moveDown();

        const items = projectData.items || [];
        let total = 0;

        items.forEach(item => {
            const amount = parseFloat(item.amount) || 0;
            total += amount;
            doc.font('Helvetica')
               .text(`${item.description}: `, { continued: true })
               .text(`$${amount.toFixed(2)}`, { align: 'right' });
        });

        // Add total
        doc.moveDown()
           .font('Helvetica-Bold')
           .text('Total: ', { continued: true })
           .text(`$${total.toFixed(2)}`, { align: 'right' })
           .moveDown(2);

        // Add footer
        doc.fontSize(10)
           .text('Thank you for your business!', { align: 'center' })
           .text('This quote is valid for 30 days from the date of issue.', { align: 'center' });

        // Finalize the PDF
        doc.end();

        // Wait for PDF generation to complete
        const pdfBuffer = await pdfComplete;

        // Return the PDF as a response
        return new Response(pdfBuffer, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment; filename="generated.pdf"'
            }
        });

    } catch (error) {
        console.error('PDF generation error:', error);
        return json({ error: 'Failed to generate PDF' }, { status: 500 });
    }
} 