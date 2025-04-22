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
    .search-container {
        padding: 16px;
        max-width: 600px;
        margin: 0 auto;
        position: relative; /* Added for dropdown positioning */
    }

    input {
        width: 100%;
        padding: 12px 16px;
        margin-bottom: 0; /* Removed margin bottom */
        box-sizing: border-box;
        border: 2px solid #e2e8f0;
        border-radius: 8px;
        font-size: 16px;
        transition: border-color 0.2s ease;
    }

    input:focus {
        outline: none;
        border-color: #4f46e5;
        box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
    }

    .dropdown {
        position: absolute;
        top: calc(100% - 16px);
        left: 16px;
        right: 16px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        max-height: 300px;
        overflow-y: auto;
        z-index: 1000;
    }

    ul {
        list-style-type: none;
        padding: 0;
        margin: 0;
    }

    li {
        padding: 14px 16px;
        border-bottom: 1px solid #e2e8f0;
        cursor: pointer;
        transition: background-color 0.2s ease;
    }

    li:last-child {
        border-bottom: none;
    }

    li:hover {
        background-color: #f8fafc;
    }

    li:active {
        background-color: #f1f5f9;
    }

    p {
        text-align: center;
        color: #64748b;
        padding: 20px;
        font-size: 16px;
        margin: 0;
    }

    @media (max-width: 600px) {
        .search-container {
            padding: 12px;
        }

        input {
            padding: 10px 14px;
            font-size: 16px;
        }

        .dropdown {
            left: 12px;
            right: 12px;
            max-height: 250px; /* Smaller height on mobile */
        }

        li {
            padding: 12px 14px;
            font-size: 15px;
        }
    }
</style>

<div class="search-container">
    <input 
        type="text" 
        bind:value={searchQuery} 
        placeholder="Search clients by name"
    />
    
    {#if searchQuery && clients.length > 0}
        <div class="dropdown">
            <ul>
                {#each clients as client}
                    <li on:click={() => selectClient(client)}>
                        {client.businessname || client.name}
                    </li>
                {/each}
            </ul>
        </div>
    {:else if searchQuery}
        <div class="dropdown">
            <p>No clients found.</p>
        </div>
    {/if}
</div>

