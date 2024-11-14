<script>
    import { onMount } from 'svelte';
    import NewUser from '../../client/new/+page.svelte'

    export let selectedUser = null;
    
    let searchTerm = '';
    let users = [];
    let filteredUsers = [];
    let showDialog = false;
    let isSearching = false;
    let newUser = {
        name: '',
        email: ''
    };

    // Simulated users data - replace with your actual API call
    onMount(async () => {
        users = [
            { id: 1, name: 'Jan de Vries', email: 'jan@example.com' },
            { id: 2, name: 'Emma van Dijk', email: 'emma@example.com' },
            // Add more users or fetch from API
        ];
    });

    $: {
        if (searchTerm) {
            filteredUsers = users.filter(user => 
                user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase())
            );
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
        selectedUser = user;
        searchTerm = ''; // Clear search
        isSearching = false; // Exit search mode
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
</script>

<div class="search-container">
    <input
        type="text"
        placeholder="Zoek gebruikers..."
        value={isSearching ? searchTerm : (selectedUser?.name || '')}
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
                    <span>{user.name}</span>
                    <span class="email">{user.email}</span>
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
    <div class="dialog-overlay">
        <div class="dialog">
            <NewUser></NewUser>
        </div>
    </div>
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
