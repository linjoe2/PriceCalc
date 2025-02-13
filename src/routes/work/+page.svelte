<script lang="ts">
  import { Checkbox } from "$lib/components/ui/checkbox";
  import * as Card from "$lib/components/ui/card";
  import { onMount } from 'svelte';
  import { ScrollArea } from "$lib/components/ui/scroll-area/index.js";
  import { Separator } from "$lib/components/ui/separator/index.js";
  import { client } from '$lib/appwrite';
  import { Databases, Query } from 'appwrite';
	import ImageUploader from "../../components/ImageUploader.svelte";
  import type { Project, Task, UploadedImage } from '$lib/types';

  const databaseId = 'PriceCalc'; // Your database ID
  const projectsCollectionId = '67362a9400133ceb48ac'; // Your collection ID

  let projects: Project[] = [];
  let selectedProject: Project | null = null;
  let tasks: Task[] = [];
  let uploadedImages: UploadedImage[] = [];
  

  onMount(async () => {
    const databases = new Databases(client);

    try {
      const response = await databases.listDocuments(databaseId, projectsCollectionId, [Query.limit(100),Query.offset(0), Query.equal('fase', ['started', 'in progress'])]);
      projects = response.documents as unknown as Project[];
      console.log(projects);

    } catch (error) {
      console.error('Failed to fetch projects:', error);
    }
  });

  function selectProject(project: Project) {
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

  async function updateTaskCompletion(task: Task) {
    const databases = new Databases(client);
    console.log(task)
    task.completed = !task.completed
    try {
      await databases.updateDocument(databaseId,"67648ca200024526b701", task.$id || '', {
        completed: task.completed
      });
      console.log(`Task ${task.$id} updated successfully.`);
    } catch (error) {
      console.error(`Failed to update task ${task.$id}:`, error);
    }
  }

  function groupTasksByCategory(tasks: Task[]) {
    const grouped: Record<string, Record<string, Task[]>> = {};
    tasks.forEach(task => {
      if (!grouped[task.category]) {
        grouped[task.category] = {};
      }
      if (!grouped[task.category][task.subcategory]) {
        grouped[task.category][task.subcategory] = [];
      }
      grouped[task.category][task.subcategory].push(task);
    });
    return grouped;
  }
</script>

<div class="container">
  <ScrollArea class="h-72 w-48 rounded-md border">
    <div class="p-4">
      <h4 class="mb-4 text-sm font-medium leading-none">Projects</h4>
      {#each projects as project}
        <button 
          class="text-sm w-full text-left hover:bg-gray-100 p-2 rounded"
          on:click={() => selectProject(project)}
        >
          {project.client.name} 05/01/2025
        </button>
        <Separator class="my-2" />
      {/each}
    </div>
  </ScrollArea>

  {#if selectedProject}
    <div class="task-list" role="region" aria-label="Project tasks">
      <Card.Root>
        <Card.Header>
          <Card.Title>{selectedProject.name}</Card.Title>
          <Card.Description>Taak voor: John</Card.Description>
          <p>Klant: {selectedProject.client.name} {selectedProject.client.lastname}</p>
          <p>Bedrijfsnaam: {selectedProject.client.businessname}</p>
        </Card.Header>
        <Card.Content>
          {#each Object.entries(groupTasksByCategory(tasks)) as [category, subcategories]}
            <div role="region" aria-label={category}>
              <h5 class="text-lg font-bold">{category}</h5>
              {#each Object.entries(subcategories) as [subcategory, tasks]}
                <div role="region" aria-label={subcategory}>
                  <h6 class="text-md font-bold">{subcategory}</h6>
                  {#each tasks as task}
                    <div class="flex items-center gap-2">
                      <Checkbox 
                        bind:checked={task.completed} 
                        on:click={() => updateTaskCompletion(task)}
                        aria-label={`Mark task ${task.description} as ${task.completed ? 'incomplete' : 'complete'}`}
                      /> 
                      <span>{task.description}</span>
                    </div>
                  {/each}
                </div>
              {/each}
            </div>
          {/each}

          <ImageUploader category="achter af" bind:uploadedImages={uploadedImages} on:upload={event => console.log('File uploaded:', event.detail.file)} />
        </Card.Content>
        <Card.Footer>
          <button 
            class="primary-button" 
            on:click={confirmAllTasks}
            aria-label="Mark all tasks as complete"
          >
            Alles uitgevoerd
          </button>
          <button 
            class="primary-button" 
            on:click={saveTasks}
            aria-label="Save all changes"
          >
            Save
          </button>
        </Card.Footer>
      </Card.Root>
    </div>
  {/if}
</div>

<style>
  .container {
    display: flex;
  }
 
  .task-list {
    width: 70%;
    padding: 10px;
  }
  .primary-button {
    background-color: #007bff;
    color: white;
    border: none;
    padding: 10px 20px;
    cursor: pointer;
    border-radius: 5px;
    margin-right: 10px;
  }
  .primary-button:hover {
    background-color: #0056b3;
  }
</style>
