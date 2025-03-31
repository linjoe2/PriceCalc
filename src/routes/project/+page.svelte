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
  let sortField = 'createdAt';
  let sortOrder: 'asc' | 'desc' = 'desc';

  const phases = [
    "opstellen offerte",
    "offerte verstuurd",
    "akkoord",
    "niet gegund",
    "aanbetaling",
    "werkvoorbereiding",
    "tusentijdse factuur",
    "opgeleverd",
    "Eindfactuur",
    "100% opgeleverd"
  ];

  let selectedPhase = '';

  async function fetchProjects(contact?: any) {
    console.log(contact)
    try {
      const queries = [
        Query.limit(limit), 
        Query.offset(offset),
        sortOrder === 'desc' ? Query.orderDesc(sortField) : Query.orderAsc(sortField)
      ];
      
      if (selectedPhase) {
        queries.push(Query.equal('fase', selectedPhase));
      }
      
      const response = await databases.listDocuments(databaseId, collectionId, queries);
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

  function handleSort(field: string) {
    if (sortField === field) {
      // Toggle sort order if clicking the same field
      sortOrder = sortOrder === 'desc' ? 'asc' : 'desc';
    } else {
      // New field, default to descending
      sortField = field;
      sortOrder = 'desc';
    }
    fetchProjects();
  }
</script>

<div class="flex flex-col gap-4 table-container">
  <h1>Projecten</h1>
  <div class="flex justify-between items-center">
  
   <Input
    class="max-w-sm"
    placeholder="Filter projects..."
    type="text"
    bind:value={filterValue}
  />
     <a href="/project/edit/new"><button class="border border-black rounded-md px-4 py-2">Project aanmaken</button></a>

</div>

  <div class="rounded-md border">
    <Table.Root>
      <Table.Header>
        <Table.Row>
          <Table.Cell>Opdrachtgever</Table.Cell>
          <Table.Cell>Adress</Table.Cell>
          <Table.Cell>
            <button on:click={() => handleSort('projectNumber')} class="w-full text-left">
              Offertenummer {sortField === 'projectNumber' ? (sortOrder === 'desc' ? '↓' : '↑') : ''}
            </button>
          </Table.Cell>
          <Table.Cell>
            <button on:click={() => handleSort('$updatedAt')} class="w-full text-left">
              Datum {sortField === '$updatedAt' ? (sortOrder === 'desc' ? '↓' : '↑') : ''}
            </button>
          </Table.Cell>
          <Table.Cell>
            <button on:click={() => handleSort('fase')} class="w-full text-left">
              Fase {sortField === 'fase' ? (sortOrder === 'desc' ? '↓' : '↑') : ''}
            </button>
            <select 
              bind:value={selectedPhase} 
              on:change={() => fetchProjects()}
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            >
              <option value="">Alle fases</option>
              {#each phases as phase}
                <option value={phase}>{phase}</option>
              {/each}
            </select>
          </Table.Cell>
          <Table.Cell>
            <button on:click={() => handleSort('progress')} class="w-full text-left">
              Voortgang {sortField === 'progress' ? (sortOrder === 'desc' ? '↓' : '↑') : ''}
            </button>
          </Table.Cell>
          <Table.Cell>Acties</Table.Cell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {#each projects as project}
          <Table.Row>
            <Table.Cell>
              <a href="/project/view/{project.$id}">
                {project.client.businessname || project.client.name}
              </a>
            </Table.Cell>
            <Table.Cell><a href="/project/view/{project.$id}">{project.adress || `${project.client.adress} ${project.client.huisnummer}, ${project.client.postcode} ${project.client.woonplaats}`}</a></Table.Cell>
            <Table.Cell><a href="/project/view/{project.$id}">{project.projectNumber}</a></Table.Cell>
            <Table.Cell>{new Date(project.$updatedAt ?? Date.now()).toLocaleDateString('nl-NL', { year: 'numeric', month: 'long', day: 'numeric' })}</Table.Cell>
            <Table.Cell>{project.fase}</Table.Cell>
            <Table.Cell><a href="/project/view/{project.$id}">{project.progress}%</a></Table.Cell>
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
  .table-container {
    max-width: 90vw;
  }
</style>
