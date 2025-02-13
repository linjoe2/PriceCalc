<script lang="ts">
  import { onMount } from 'svelte';
  import { Databases, Query } from "appwrite";
  import { client } from "$lib/appwrite";
  import Plus from "lucide-svelte/icons/plus";
  import Pencil from "lucide-svelte/icons/pencil";
  import Trash from "lucide-svelte/icons/trash";
  import { Input } from "$lib/components/ui/input/index.js";
  import * as Table from "$lib/components/ui/table";
  import { chatwootContact } from '../../stores/userStore';
  import type { Project } from '$lib/types';

  const databases = new Databases(client);
  const databaseId = 'PriceCalc';
  const collectionId = '67362a9400133ceb48ac';

  let projects: Project[] = [];
  let filterValue = '';
  let offset = 0;
  const limit = 100;

  async function fetchProjects(contact?: any) {
    console.log(contact)
    try {
      const response = await databases.listDocuments(databaseId, collectionId, [Query.limit(limit), Query.offset(offset), Query.orderDesc("createdAt")]);
      projects = response.documents.map((doc: any) => ({
        ...doc,
        isEditing: false,
        isOpen: false
      }));
      
      console.log(response);
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  }

  $: fetchProjects($chatwootContact)

  onMount(fetchProjects);

  function nextPage() {
    offset += limit;
    fetchProjects();
  }

  function previousPage() {
    if (offset >= limit) {
      offset -= limit;
      fetchProjects();
    }
  }

  async function deleteProject(id: string | undefined) {
    if (!id) return;
    await databases.deleteDocument(databaseId, collectionId, id);
    projects = projects.filter((project: Project) => project.$id !== id);
    console.log(projects);
  }
</script>

<div class="flex flex-col gap-4 table-container">
  <h1>Projects</h1>
  <div class="flex justify-between items-center">
  
   <Input
    class="max-w-sm"
    placeholder="Filter projects..."
    type="text"
    bind:value={filterValue}
  />
     <a href="/project/edit/new"><button><Plus class="h-4 w-4" /></button></a>

</div>

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
        {#each projects as project}
          <Table.Row>
            <Table.Cell>
              <a href="/project/view/{project.$id}">
                {project.client.name} {project.client.lastname}
              </a>
            </Table.Cell>
            <Table.Cell><a href="/project/view/{project.$id}">{new Date(project.$updatedAt).toLocaleDateString('nl-NL', { year: 'numeric', month: 'long', day: 'numeric' })}</a></Table.Cell>
            <Table.Cell><a href="/project/view/{project.$id}">{JSON.parse(project.items).length} items</a></Table.Cell>
            <Table.Cell>{project.fase}</Table.Cell>
            <Table.Cell>
              <a href="/project/edit/{project.$id}" class="mr-2">
                <button><Pencil class="h-4 w-4" /></button>
              </a>
              <button on:click={() => deleteProject(project.$id)} class="ml-2">
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
  .table-container {
    max-width: 90vw;
  }
</style>
