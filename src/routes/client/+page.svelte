<script lang="ts">
    import { onMount } from "svelte";
    import { Databases, Query } from "appwrite";
    import { client } from '$lib/appwrite';
    import { readable } from "svelte/store";
    import * as Table from "$lib/components/ui/table/index.js";
    import { Button } from "$lib/components/ui/button/index.js";
    import { Input } from "$lib/components/ui/input/index.js";
    import type { Client } from "$lib/types";

    const databases = new Databases(client);
    let clients: Client[] = [];
    let filterValue: string | null = null;
    let isDialogOpen = false;
    // let selectedClient = null;
    let Mounted = false;
    let offset = 0;
    const limit = 10; // Set the number of items per page


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

    function nextPage() {
        offset += limit;
        fetchClients(filterValue);
    }

    function previousPage() {
        if (offset >= limit) {
            offset -= limit;
            fetchClients(filterValue);
        }
    }


    onMount(async () => {
        Mounted = true;
        fetchClients(filterValue);
    });

    $: fetchClients(filterValue);
</script>

<div class="w-full table-container">
    <div class="mb-4 flex items-center gap-4 justify-between">
        <Input
            class="max-w-sm"
            placeholder="Filter clients..."
            type="text"
            bind:value={filterValue}
        />
        <div class="flex items-center gap-4">
            <a href="/client/sub">
                <Button class="ml-auto mr-4 border border-black" variant="primary">+ onderaannemer</Button>
            </a>
            <a href="/client/new">
                <Button class="ml-auto mr-4 border border-black" variant="primary">+ klant</Button>
            </a>
        </div>
    </div>
    <div class="rounded-md border">
        <Table.Root>
            <Table.Header>
                <Table.Row>
                    <Table.Head>Name</Table.Head>
                    <Table.Head>Last Name</Table.Head>
                    <Table.Head>Address</Table.Head>
                    <Table.Head>House Number</Table.Head>
                    <Table.Head>Postal Code</Table.Head>
                    <Table.Head>City</Table.Head>
                </Table.Row>
            </Table.Header>
            <Table.Body>
                {#each clients as client (client.$id)}
                    <Table.Row on:click={() => window.location.href = `/client/view/${client.$id}`}>
                        <Table.Cell>{client.name}</Table.Cell>
                        <Table.Cell>{client.lastname}</Table.Cell>
                        <Table.Cell>{client.adress}</Table.Cell>
                        <Table.Cell>{client.huisnummer}</Table.Cell>
                        <Table.Cell>{client.postcode}</Table.Cell>
                        <Table.Cell>{client.woonplaats}</Table.Cell>
                    </Table.Row>
                {/each}
            </Table.Body>
        </Table.Root>
    </div>
</div>

<div class="pagination-controls">
    <Button on:click={previousPage} disabled={offset === 0}>Terug   </Button>
    <Button on:click={nextPage}>Volgende</Button>
</div>

<!-- <ClientDialog
    bind:isOpen={isDialogOpen}
    bind:selectedClient={selectedClient}
    on:close={closeDialog}
/> -->

<style>
    .table-container {
        max-width: 90vw;
    }
    .pagination-controls {
        display: flex;
        justify-content: space-between;
        margin-top: 1rem;
    }
</style>