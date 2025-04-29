<script lang="ts">
  import type { Item } from '$lib/types';

  export let project: any;
  export let category: string;
  export let item: Item;
  export let projects: any[];

  let draggedIndex: number | null = null;

  // Function to check if text contains a placeholder and extract options
  function getPlaceholderOptions(text: string): string[] | null {
    const match = text.match(/<(.+?)>/);
    if (!match) return null;
    return match[1].split('|').map(opt => opt.trim());
  }

  // Function to replace placeholder with selected value
  function replacePlaceholder(text: string, selectedValue: string): string {
    return text.replace(/<.+?>/, selectedValue);
  }

  function handleDragStart(event: DragEvent, index: number) {
    draggedIndex = index;
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
    }
    const target = event.target as HTMLElement;
    target.closest('.task-item')?.classList.add('dragging');
  }

  function handleDragEnd(event: DragEvent) {
    const target = event.target as HTMLElement;
    target.closest('.task-item')?.classList.remove('dragging');
    draggedIndex = null;
  }

  function handleDragOver(event: DragEvent, index: number) {
    event.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    
    const itemIndex = project.items.findIndex((i: Item) => 
      i.category === category && 
      i.subcategory === item.subcategory && 
      i.type === item.type
    );
    
    if (itemIndex === -1) return;
    
    const tasks = project.items[itemIndex].tasks;
    const draggedTask = tasks[draggedIndex];
    tasks.splice(draggedIndex, 1);
    tasks.splice(index, 0, draggedTask);
    projects = [...projects];
    draggedIndex = index;
  }
</script>

<div class="ml-4 p-2 bg-gray-50 rounded-md">
  <h4 class="font-medium text-sm mb-2">Taken:</h4>
  {#each project.items.find((i: Item) => i.category === category && i.subcategory === item.subcategory && i.type === item.type).tasks || [] as task, taskIndex}
    <div 
      class="task-item flex items-center gap-2 mb-2 p-2 bg-white rounded border border-gray-200"
      draggable="true"
      on:dragstart={(e) => handleDragStart(e, taskIndex)}
      on:dragend={handleDragEnd}
      on:dragover={(e) => handleDragOver(e, taskIndex)}
    >
      <span class="drag-handle cursor-grab text-gray-400">⋮</span>
      <input
        type="text"
        bind:value={task.description}
        class="flex-1 p-1 text-sm border rounded"
      />
      {#if getPlaceholderOptions(task.description)}
        <select 
          class="p-1 text-sm border rounded task-select"
          on:change={(e) => {
            task.description = replacePlaceholder(task.description, e.currentTarget.value);
            projects = [...projects];
          }}
        >
          <option value="">Select...</option>
          {#each getPlaceholderOptions(task.description) as option}
            <option value={option}>{option}</option>
          {/each}
        </select>
      {/if}
      <button
        class="text-red-500 hover:text-red-700 px-2"
        on:click={() => {
          const itemIndex = project.items.findIndex((i: Item) => 
            i.category === category && 
            i.subcategory === item.subcategory && 
            i.type === item.type
          );
          project.items[itemIndex].tasks.splice(taskIndex, 1);
          projects = [...projects];
        }}
      >
        ×
      </button>
    </div>
  {/each}
  <button
    class="text-sm text-blue-500 hover:text-blue-700"
    on:click={() => {
      const itemIndex = project.items.findIndex((i: Item) => 
        i.category === category && 
        i.subcategory === item.subcategory && 
        i.type === item.type
      );
      if (!project.items[itemIndex].tasks) {
        project.items[itemIndex].tasks = [];
      }
      project.items[itemIndex].tasks.push({ description: '', completed: false });
      projects = [...projects];
    }}
  >
    + Nieuwe taak
  </button>
</div>

<style>
  .task-input {
    width: 100%;
  }

  .task-select {
    width: 100px;
  }

  .task-item.dragging {
    opacity: 0.5;
    border: 1px dashed #666;
  }

  .drag-handle {
    user-select: none;
  }
</style>