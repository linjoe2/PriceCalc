import { Client, Account } from 'appwrite';

export const client = new Client();

client
    .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT)
    .setProject(import.meta.env.VITE_APPWRITE_PROJECT); // Replace with your project ID

export const account = new Account(client);
//account.getSession()


export { ID } from 'appwrite';
