<script lang="ts">
  import { onMount } from 'svelte';
  import { Databases, Query } from "appwrite";
  import { client } from "$lib/appwrite";
  import Plus from "lucide-svelte/icons/plus";
  import Pencil from "lucide-svelte/icons/pencil";
  import Trash from "lucide-svelte/icons/trash";
  import { readable } from "svelte/store";
  import { Button } from "$lib/components/ui/button/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import * as Table from "$lib/components/ui/table";


  const databases = new Databases(client);
  const databaseId = 'PriceCalc';
  const collectionId = '67362a9400133ceb48ac';

  let services = [];
  let filterValue = '';
  let offset = 0;
  const limit = 100;

  async function fetchServices() {
    try {
      const response = await databases.listDocuments(databaseId, collectionId, [Query.limit(limit), Query.offset(offset), Query.orderDesc("createdAt")]);
      services = response.documents;
      console.log(response);
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  }

  onMount(fetchServices);

  function nextPage() {
    offset += limit;
    fetchServices();
  }

  function previousPage() {
    if (offset >= limit) {
      offset -= limit;
      fetchServices();
    }
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
    <Table.Root>
      <Table.Header>
        <Table.Row>
          <Table.Cell>Klant</Table.Cell>
          <Table.Cell>Datum</Table.Cell>
          <Table.Cell>Artikelen</Table.Cell>
          <Table.Cell>fase</Table.Cell>
          <Table.Cell>Actions</Table.Cell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {#each services as service}
          <Table.Row>
            <Table.Cell>
              <a href="/project/view/{service.$id}">
                {service.client.name} {service.client.lastname}
              </a>
            </Table.Cell>
            <Table.Cell><a href="/project/view/{service.$id}">{new Date(service.updatedAt).toLocaleDateString('nl-NL', { year: 'numeric', month: 'long', day: 'numeric' })}</a></Table.Cell>
            <Table.Cell><a href="/project/view/{service.$id}">{JSON.parse(service.items).length} items</a></Table.Cell>
            <Table.Cell>{service.fase}</Table.Cell>
            <Table.Cell>
              <a href="/project/edit/{service.$id}" class="mr-2">
                <button><Pencil class="h-4 w-4" /></button>
              </a>
              <button on:click={() => deleteProject(service.$id)} class="ml-2">
                <Trash class="h-4 w-4" />
              </button>
            </Table.Cell>
          </Table.Row>
        {/each}
      </Table.Body>
    </Table.Root>
  </div>

  <div class="flex justify-between mt-4">
    <button on:click={previousPage} disabled={offset === 0}>Terug</button>
    <button on:click={nextPage}>Volgende</button>
  </div>
</div>

<style>
  tr {
    margin-bottom: 20px;
  }
</style>
