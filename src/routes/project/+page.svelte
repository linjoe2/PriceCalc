<script lang="ts">
  import { onMount } from 'svelte';
  import { Databases, Query } from "appwrite";
  import { client } from "$lib/appwrite";
  import Plus from "lucide-svelte/icons/plus";
  import Pencil from "lucide-svelte/icons/pencil";
  import Trash from "lucide-svelte/icons/trash";
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

  const databases = new Databases(client);
  const databaseId = 'PriceCalc';
  const collectionId = '67362a9400133ceb48ac';

  let services = [];
  let filterValue = '';
  let tableAttrs, tableBodyAttrs, headerRows, pageRows, hasNextPage, hasPreviousPage, pageIndex;
  let pluginStates;

  onMount(async () => {
    try {
      const response = await databases.listDocuments(databaseId, collectionId, [Query.limit(100), Query.offset(0)]);
      services = response.documents;
      console.log(response);
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  });

  $: if (services.length > 0) {
    const table = createTable(readable(services), {
      sort: addSortBy({ disableMultiSort: true }),
      page: addPagination(),
      filter: addTableFilter({
        fn: ({ filterValue, value }) => value.includes(filterValue)
      }),
      select: addSelectedRows()
    });
    console.log(services);
    const columns = table.createColumns([
      table.column({
        header: "Klant",
        accessor: "client",
        cell: ({ value }) => `${value.name} ${value.lastname}`
      }),
      // table.column({
      //   header: "Adres",
      //   accessor: "adress",
      //   cell: ({ value }) => `${value.adress} ${value.huisnummer}`
      // }),
      table.column({
        header: "Datum",
        accessor: "updatedAt",
        cell: ({ value }) => new Date(value).toLocaleDateString('nl-NL', { year: 'numeric', month: 'long', day: 'numeric' })
      }),
      table.column({
        header: "Artikelen",
        accessor: "items",
        cell: ({ value }) => `${JSON.parse(value).length} items`
      })

    ]);

    const viewModel = table.createViewModel(columns);

    ({ headerRows, pageRows, tableAttrs, tableBodyAttrs, pluginStates } = viewModel);
    console.log($headerRows);

    filterValue = pluginStates.filter.filterValue;
    ({ hasNextPage, hasPreviousPage, pageIndex } = pluginStates.page);
  }

  async function deleteProject(id: string) {
    await databases.deleteDocument(databaseId, collectionId, id);
    services = services.filter(service => service.$id !== id);
    console.log(services);
  }
</script>

<div class="flex flex-col gap-4 max-w-400px">
  <div class="flex justify-between items-center">
    <h1>Projects</h1>
    <a href="/project/edit/new"><button><Plus class="h-4 w-4" /></button></a>
  </div>

  <Input
    class="max-w-sm"
    placeholder="Filter projects..."
    type="text"
    bind:value={filterValue}
  />

  <div class="rounded-md border">
    <Table.Root {...tableAttrs}>
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
      <Table.Body {...tableBodyAttrs}>
        {#each $pageRows as row (row.id)}
          <Subscribe rowAttrs={row.attrs()} let:rowAttrs>
            <Table.Row {...rowAttrs}>
              {#each row.cells as cell (cell.id)}
                  <Subscribe attrs={cell.attrs()} let:attrs>
                    <Table.Cell {...attrs} on:click={() => window.location.href = `/project/view/${row.original.$id}`}>
                      <Render of={cell.render()} />
                    </Table.Cell>
                  </Subscribe>
              {/each}
              <Table.Cell>
                <a href="/project/edit/{row.original.$id}" class="mr-2">
                  <button><Pencil class="h-4 w-4" /></button>
                </a>
                <button on:click={() => deleteProject(row.original.$id)} class="ml-2">
                  <Trash class="h-4 w-4" />
                </button>
              </Table.Cell>
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
      on:click={() => (pageIndex = pageIndex - 1)}
      disabled={!hasPreviousPage}>Previous</Button>
    <Button
      variant="outline"
      size="sm"
      disabled={!hasNextPage}
      on:click={() => (pageIndex = pageIndex + 1)}>Next</Button>
  </div>
</div>

<style>
  tr {
    margin-bottom: 20px;
  }
</style>
