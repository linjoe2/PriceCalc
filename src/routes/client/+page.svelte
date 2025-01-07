<script lang="ts">
    import { onMount } from "svelte";
    import { Databases } from "appwrite";
    import { client } from '$lib/appwrite';
    import {
        Render,
        Subscribe,
        createRender,
        createTable
    } from "svelte-headless-table";
    import {
        addPagination,
        addSelectedRows,
        addSortBy,
        addTableFilter
    } from "svelte-headless-table/plugins";
    import { readable } from "svelte/store";
    import * as Table from "$lib/components/ui/table/index.js";
    import { Button } from "$lib/components/ui/button/index.js";
    import { Input } from "$lib/components/ui/input/index.js";
    import ClientDialog from './ClientDialog.svelte'; // Import the dialog component

    const databases = new Databases(client);
    let clients = [];
    let table;
    let columns;
    let headerRows, pageRows, tableAttrs, tableBodyAttrs, pluginStates;
    let filterValue, hasNextPage, hasPreviousPage, pageIndex, selectedDataIds;
    let isDialogOpen = false; // State to control dialog visibility
    let selectedClient = null; // State to store the selected client

    function openDialog(client) {
        selectedClient = client;
        isDialogOpen = true;
    }

    function closeDialog() {
        isDialogOpen = false;
    }

    onMount(async () => {
        const result = await databases.listDocuments(
            'PriceCalc', // databaseId
            '67362abc0039525e36b6', // collectionId
            [] // queries (optional)
        );
        clients = result.documents;

        table = createTable(readable(clients), {
            sort: addSortBy({ disableMultiSort: true }),
            page: addPagination(),
            filter: addTableFilter({
                fn: ({ filterValue, value }) => value.includes(filterValue)
            }),
            select: addSelectedRows()
        });

        columns = table.createColumns([
            table.column({
                header: "Name",
                accessor: "name",
            }),
            table.column({
                header: "Last Name",
                accessor: "lastname",
            }),
            table.column({
                header: "Address",
                accessor: "adress",
            }),
            table.column({
                header: "House Number",
                accessor: "huisnummer",
            }),
            table.column({
                header: "Postal Code",
                accessor: "postcode",
            }),
            table.column({
                header: "City",
                accessor: "woonplaats",
            })
        ]);

        ({ headerRows, pageRows, tableAttrs, tableBodyAttrs, pluginStates } = table.createViewModel(columns));
        ({ filterValue } = pluginStates.filter);
        ({ hasNextPage, hasPreviousPage, pageIndex } = pluginStates.page);
        ({ selectedDataIds } = pluginStates.select);
    });
</script>

<div class="w-full table-container">
    <div class="mb-4 flex items-center gap-4 justify-between">
        <Input
            class="max-w-sm"
            placeholder="Filter clients..."
            type="text"
            bind:value={$filterValue}
        />
        <a href="/client/new">
        <Button
            class="ml-auto"
            variant="primary">+ klant</Button>
            </a>
    </div>
    <div class="rounded-md border">
        <Table.Root {...$tableAttrs}>
            <Table.Header>
                {#each $headerRows as headerRow}
                    <Subscribe rowAttrs={headerRow.attrs()}>
                        <Table.Row>
                            {#each headerRow.cells as cell (cell.id)}
                                <Subscribe attrs={cell.attrs()} let:attrs>
                                    <Table.Head {...attrs}>
                                        <Render of={cell.render()} />
                                    </Table.Head>
                                </Subscribe>
                            {/each}
                        </Table.Row>
                    </Subscribe>
                {/each}
            </Table.Header>
            <Table.Body {...$tableBodyAttrs}>
                {#each $pageRows as row (row.id)}
                    <Subscribe rowAttrs={row.attrs()} let:rowAttrs>
                        <Table.Row {...rowAttrs} on:click={() => openDialog(row.original)}>
                            {#each row.cells as cell (cell.id)}
                                <Subscribe attrs={cell.attrs()} let:attrs>
                                    <Table.Cell {...attrs}>
                                        <Render of={cell.render()} />
                                    </Table.Cell>
                                </Subscribe>
                            {/each}
                        </Table.Row>
                    </Subscribe>
                {/each}
            </Table.Body>
        </Table.Root>
    </div>
    <div class="flex items-center justify-end space-x-2 py-4">
        <Button
            variant="outline"
            size="sm"
            on:click={() => ($pageIndex = $pageIndex - 1)}
            disabled={!$hasPreviousPage}>Previous</Button>
        <Button
            variant="outline"
            size="sm"
            disabled={!$hasNextPage}
            on:click={() => ($pageIndex = $pageIndex + 1)}>Next</Button>
    </div>
</div>

<ClientDialog
    bind:isOpen={isDialogOpen}
    bind:selectedClient={selectedClient}
    on:close={closeDialog}
/>


<style>
    .table-container {
        max-width: 90vw;
    }
</style>