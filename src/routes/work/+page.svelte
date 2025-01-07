<script>
  import { Checkbox } from "$lib/components/ui/checkbox";
  import * as Card from "$lib/components/ui/card";
  import { onMount } from 'svelte';
  import { ScrollArea } from "$lib/components/ui/scroll-area/index.js";
  import { Separator } from "$lib/components/ui/separator/index.js";
  import { client } from '$lib/appwrite';
  import { Databases } from 'appwrite';
  const databaseId = 'PriceCalc'; // Your database ID
  const projectsCollectionId = '67362a9400133ceb48ac'; // Your collection ID

  let projects = [];
  let selectedProject = null;
  let tasks = [];

  onMount(async () => {
    const databases = new Databases(client);

    try {
      const response = await databases.listDocuments(databaseId, projectsCollectionId);
      console.log(response)
      projects = response.documents.filter(project => 
        project.fase === 'started' || project.fase === "in progress"
      );
      console.log(projects)
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    }
  });

  function selectProject(project) {
    selectedProject = project;
    tasks = project.tasks;
  }

  function confirmAllTasks() {
    tasks = tasks.map(task => ({ ...task, completed: true }));
  }

  function saveTasks() {
    // Logic to save the tasks
    console.log('Tasks saved:', tasks);
    // You can add your API call here to save the tasks to the database
  }
</script>

<div class="container">
  <ScrollArea class="h-72 w-48 rounded-md border">
    <div class="p-4">
      <h4 class="mb-4 text-sm font-medium leading-none">Projects</h4>
      {#each projects as project}
        <div class="text-sm" on:click={() => selectProject(project)}>
          {project.client.name} 05/01/2025
        </div>
        <Separator class="my-2" />
      {/each}
    </div>
  </ScrollArea>

  {#if selectedProject}
    <div class="task-list">
      <Card.Root>
        <Card.Header>
          <Card.Title>{selectedProject.name}</Card.Title>
          <Card.Description>Taak voor: John</Card.Description>
          <p>Klant: {selectedProject.client.name} {selectedProject.client.lastname}</p>
          <p>Bedrijfsnaam: {selectedProject.client.businessname}</p>
        </Card.Header>
        <Card.Content>
          {#each tasks as task}
            <div>
              <Checkbox bind:checked={task.completed} /> {task.description}
            </div>
          {/each}
        </Card.Content>
        <Card.Footer>
          <button on:click={confirmAllTasks}>Alles uitgevoerd</button>
          <button on:click={saveTasks}>Save</button>
        </Card.Footer>
      </Card.Root>
    </div>
  {/if}
</div>

<style>
  .container {
    display: flex;
  }
  .projects-list {
    width: 30%;
    border-right: 1px solid #ccc;
    padding: 10px;
  }
  .task-list {
    width: 70%;
    padding: 10px;
  }
  button {
    background-color: #007bff;
    color: white;
    border: none;
    padding: 10px 20px;
    cursor: pointer;
    border-radius: 5px;
    margin-right: 10px;
  }
  button:hover {
    background-color: #0056b3;
  }
</style>
