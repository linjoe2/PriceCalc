<script lang="ts">
    let searchQuery = '';
    let searchResults = [];
    let isLoading = false;
    export let address: string;

    async function searchAddress() {
        if (searchQuery.length < 3) return;
        
        isLoading = true;
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5&countrycodes=nl&addressdetails=1`
            );
            searchResults = await response.json();
        } catch (error) {
            console.error('Error searching address:', error);
            searchResults = [];
            console.log(searchResults);
        } finally {
            isLoading = false;
        }
    }

    // Debounce the search to avoid too many API calls
    let timeout;
    function handleInput() {
        clearTimeout(timeout);
        timeout = setTimeout(searchAddress, 300);
    }
</script>

<div class="search-container">
    <input
        type="text"
        bind:value={searchQuery}
        on:input={handleInput}
        placeholder="Search for an address..."
        class="search-input"
    />
    
    {#if isLoading}
        <div class="loading">Searching...</div>
    {/if}
    
    {#if searchResults.length > 0}
        <ul class="results-list">
            {#each searchResults as result}
                <li on:click={() => {
                    address = result.address;
                    console.log(address);
                }} class="result-item">
                    <strong>{result.display_name}</strong>
                    <div class="coordinates">
                        Lat: {result.lat}, Lon: {result.lon}
                    </div>
                </li>
            {/each}
        </ul>
    {/if}
</div>

<style>
    .search-container {
        width: 100%;
        margin: 25px auto;
    }

    .search-input {
        width: 100%;
        padding: 8px;
        font-size: 16px;
        border: 1px solid #ccc;
        border-radius: 4px;
    }

    .loading {
        margin-top: 8px;
        color: #666;
    }

    .results-list {
        list-style: none;
        padding: 0;
        margin-top: 16px;
    }

    .result-item {
        padding: 12px;
        border: 1px solid #eee;
        margin-bottom: 8px;
        border-radius: 4px;
    }

    .result-item:hover {
        background-color: #f5f5f5;
        cursor: pointer;
    }

    .coordinates {
        font-size: 14px;
        color: #666;
        margin-top: 4px;
    }
</style>
