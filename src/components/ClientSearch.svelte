<script lang="ts">
    import { Databases, Query } from 'appwrite';
    import { client } from '$lib/appwrite';
    import { onMount } from 'svelte';
    import { selectedUser } from '../stores/userStore';

    // Initialize the Appwrite client

    // Initialize the database service
    const databases = new Databases(client);

    let searchQuery = '';
    let clients = [];
    let Mounted = false;
    let limit = 10;
    let offset = 0;
    export let selectedClient: Client | null = null;

    onMount(() => {
        Mounted = true;
    });
    // Function to search clients
    async function fetchClients(filterValue: string | null) {
        if (Mounted == false) {
            return;
        }
        const searchQuery = filterValue ? [Query.search('search', filterValue)] : [];
        const result = await databases.listDocuments(
            'PriceCalc',
            '67362abc0039525e36b6',
            [...searchQuery, Query.limit(limit), Query.offset(offset), Query.orderAsc("lastname")]
        );
        clients = result.documents as unknown as Client[];
    }
    
    function selectClient(client: Client) {
        $selectedUser = client;
    }

    $: fetchClients(`${searchQuery}`);
</script>

<style>
    /* Add your styles here */
    div {
        padding: 10px;
    }

    input {
        width: 100%;
        padding: 8px;
        margin-bottom: 10px;
        box-sizing: border-box;
    }

    ul {
        list-style-type: none;
        padding: 0;
    }

    li {
        padding: 10px;
        border: 1px solid #ccc;
        margin-bottom: 5px;
        cursor: pointer;
    }

    li:hover {
        background-color: #f0f0f0;
    }

    @media (max-width: 600px) {
        li {
            font-size: 14px;
        }
    }
</style>

<div>
    <input type="text" bind:value={searchQuery} placeholder="Search clients by name" />
</div>

{#if clients.length > 0}
    <ul>
        {#each clients as client}
            <li on:click={() => selectClient(client)}>{client.name}</li>
        {/each}
    </ul>
{:else}
    <p>No clients found.</p>
{/if}

