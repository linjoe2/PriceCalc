<script lang="ts">
  import type { Item } from '$lib/types';

  export let project: any;
  export let category: string;
  export let item: Item;
  export let projects: any[];

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
</script>

<div class="ml-4 p-2 bg-gray-50 rounded-md">
  <h4 class="font-medium text-sm mb-2">Taken:</h4>
  {#each project.items.find((i: Item) => i.category === category && i.subcategory === item.subcategory && i.type === item.type).tasks || [] as task, taskIndex}
    <div class="flex items-center gap-2 mb-2">
      <input
        type="text"
        bind:value={task.description}
        class="flex-1 p-1 text-sm border rounded"
      />
      {#if getPlaceholderOptions(task.description)}
        <select 
          class="p-1 text-sm border rounded"
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