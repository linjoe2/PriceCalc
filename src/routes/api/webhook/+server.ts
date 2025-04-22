import { json } from '@sveltejs/kit';

// The secret token from Documenso
const WEBHOOK_SECRET = 'Gedee17eLosAngele$G1$ter@vond';

export async function POST({ request }) {
  try {
    // Verify the webhook secret
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ') || authHeader.substring(7) !== WEBHOOK_SECRET) {
      console.error('Invalid webhook secret');
      return json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get the raw body as text
    const rawBody = await request.text();
    
    // Log the raw request body
    console.log('Webhook received:', rawBody);
    
    // Try to parse as JSON if possible
    try {
      const jsonBody = JSON.parse(rawBody);
      console.log('Webhook data (parsed JSON):', JSON.stringify(jsonBody, null, 2));
      
      // Process different webhook events
      if (jsonBody.type) {
        switch (jsonBody.type) {
          case 'DOCUMENT_COMPLETED':
            console.log('Document completed:', jsonBody.documentId);
            // Handle document completion
            break;
          case 'DOCUMENT_VIEWED':
            console.log('Document viewed:', jsonBody.documentId);
            // Handle document viewed
            break;
          case 'RECIPIENT_COMPLETED':
            console.log('Recipient completed signing:', jsonBody.recipientId);
            // Handle recipient completion
            break;
          default:
            console.log('Unknown webhook event type:', jsonBody.type);
        }
      }
    } catch (e) {
      console.log('Webhook data is not valid JSON');
    }
    
    // Log request headers
    const headers = Object.fromEntries(request.headers.entries());
    console.log('Webhook headers:', headers);
    
    // Return a success response
    return json({ success: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return json({ error: 'Failed to process webhook' }, { status: 500 });
  }
} 