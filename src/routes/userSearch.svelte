<script lang="ts">
    import { onMount } from 'svelte';
    import NewUser from './client/new/+page.svelte';
    import { client } from "$lib/appwrite";
    import { Databases, Query } from "appwrite";
    import { selectedUser } from '../stores/userStore';
    import ClientDialog from './client/ClientDialog.svelte'; // Adjust the path as necessary

    let searchTerm = '';
    let users = [];
    let filteredUsers = [];
    let showDialog = false;
    let isSearching = false;
    let newUser = {
        name: '',
        email: ''
    };
    let selectedClient = null;
    let isDialogOpen = false;
    let searchTimeout;

    // Fetch users from Appwrite
    onMount(async () => {
        try {
            const databases = new Databases(client);
            const response = await databases.listDocuments(
            'PriceCalc', // databaseId
            '67362abc0039525e36b6', // collectionId
            [] // queries (optional)
        );

            users = response.documents;
            console.log(users);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    });

    $: {
        if (searchTerm) {
            console.log(searchTerm);
            clearTimeout(searchTimeout); // Clear previous timeout
            searchTimeout = setTimeout(async () => {
                try {
                    const databases = new Databases(client);
                    const response = await databases.listDocuments(
                        'PriceCalc', // databaseId
                        '67362abc0039525e36b6', // collectionId
                        [ // queries (optional)
                            Query.search("search", searchTerm)
                        ]
                    );

                    users = response.documents;
                    filteredUsers = users; // Directly assign the fetched users
                } catch (error) {
                    console.error('Error fetching users:', error);
                }
            }, 150); // Delay of 150ms
        } else {
            filteredUsers = [];
        }
    }

    

    function handleAddUser() {
        // Add validation here
        users = [...users, { 
            id: users.length + 1, 
            ...newUser 
        }];
        showDialog = false;
        newUser = { name: '', email: '' };
    }

    function handleSelectUser(user) {
        selectedUser.set(user);
        console.log($selectedUser);
        searchTerm = ''; // Clear search
        isSearching = false; // Exit search mode
        isDialogOpen = true; // Open user dialog
    }

    function handleInputFocus() {
        isSearching = true;
        searchTerm = '';
    }

    function handleInputBlur() {
        // Small delay to allow click events to fire before closing dropdown
        setTimeout(() => {
            isSearching = false;
            searchTerm = '';
        }, 200);
    }

    function closeDialog() {
        showDialog = false;
    }

    function stopPropagation(e) {
        e.stopPropagation();
    }

    function openDialog(client) {
        selectedClient = client;
        isDialogOpen = true;
    }

    function handleDialogClose() {
        isDialogOpen = false;
    }
</script>

<div class="search-container">
    <input
        type="text"
        placeholder="Zoek gebruikers..."
        value={isSearching ? searchTerm : (`${$selectedUser?.name} ${$selectedUser?.lastname}` || '')}
        on:input={(e) => searchTerm = e.target.value}
        on:focus={handleInputFocus}
        on:blur={handleInputBlur}
        class="search-input"
    />
    
    {#if isSearching && filteredUsers.length > 0}
        <ul class="dropdown-list">
            {#each filteredUsers as user}
                <li 
                    class="dropdown-item"
                    on:click={() => handleSelectUser(user)}
                >
                    <span>{user.name} {user.lastname}</span>
                    <span>{user.adress} {user.huisnummer}, {user.postcode} {user.woonplaats}</span>
                </li>
            {/each}
        </ul>
    {:else if isSearching && searchTerm}
        <div class="no-results">
            <p>Geen gebruikers gevonden</p>
            <button on:click={() => showDialog = true}>Nieuwe Gebruiker Toevoegen</button>
        </div>
    {/if}
    
</div>

{#if showDialog}
    <div class="dialog-overlay" on:click={closeDialog}>
        <div class="dialog" on:click={stopPropagation}>
            <button on:click={closeDialog}>x</button>
            <NewUser></NewUser>
        </div>
    </div>
{/if}

{#if isDialogOpen}
    <ClientDialog selectedClient={$selectedUser} on:close={handleDialogClose} />
     <!-- {$selectedUser} -->
{/if}

<style>
    .search-container {
        position: relative;
        width: 100%;
        max-width: 400px;
    }

    .search-input {
        width: 100%;
        padding: 8px;
        border: 1px solid #ccc;
        border-radius: 4px;
    }

    .dropdown-list {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: white;
        border: 1px solid #ccc;
        border-radius: 4px;
        margin-top: 4px;
        max-height: 200px;
        overflow-y: auto;
        list-style: none;
        padding: 0;
    }

    .dropdown-item {
        padding: 8px;
        cursor: pointer;
        display: flex;
        justify-content: space-between;
    }

    .dropdown-item:hover {
        background: #f5f5f5;
    }

    .email {
        color: #666;
        font-size: 0.9em;
    }

    .no-results {
        text-align: center;
        padding: 16px;
    }

    .dialog-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .dialog {
        background: white;
        padding: 20px;
        border-radius: 4px;
        min-width: 300px;
    }

    .dialog-input {
        width: 100%;
        margin: 8px 0;
        padding: 8px;
        border: 1px solid #ccc;
        border-radius: 4px;
    }

    .dialog-buttons {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        margin-top: 16px;
    }
</style>
