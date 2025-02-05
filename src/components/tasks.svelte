<script>
  export let tasks = [];
  console.log(tasks);
</script>

<div class="tasks-container">
  {#if tasks.length === 0}
    <p>Geen taken beschikbaar</p>
  {:else}
    <ul class="tasks-list">
      {#each tasks as task}
        <li class="task-item">
          <!-- <input 
            type="checkbox" 
            checked={task.completed} 
            on:change={() => task.completed = !task.completed}
          /> -->
            {task}
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  .tasks-container {
    margin: 1rem 0;
  }

  .tasks-list {
    list-style: none;
    padding: 0;
  }

  .task-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0;
  }

  .completed {
    text-decoration: line-through;
    color: #666;
  }
</style>
