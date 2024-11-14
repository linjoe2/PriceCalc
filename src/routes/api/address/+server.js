 // src/routes/api/address.js
 import fetch from 'node-fetch';
 
 export async function POST({ request }) {
    console.log('test')
     const { postcode, houseNumber } = await request.json();
     const url = `https://berthub.eu/pcode/${postcode}/${houseNumber}`;
    console.log(url)
     try {
         const response = await fetch(url);
         if (!response.ok) {
             return new Response(JSON.stringify({ error: 'Failed to fetch address details' }), {
                 status: response.status,
                 headers: {
                     'Content-Type': 'application/json'
                 }
             });
         }
         const data = await response.json();
         return new Response(JSON.stringify(data[0]), {
             status: 200,
             headers: {
                 'Content-Type': 'application/json'
             }
         });
     } catch (error) {
         return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
             status: 500,
             headers: {
                 'Content-Type': 'application/json'
             }
         });
     }
 }