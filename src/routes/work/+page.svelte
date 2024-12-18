<script>
    let tasks = [
        { id: 1, text: 'Task 1', completed: false },
        { id: 2, text: 'Task 2', completed: false },
        { id: 3, text: 'Task 3', completed: false }
    ];
    let photos = [];

    function toggleTaskCompletion(task) {
        task.completed = !task.completed;
    }

    function handlePhotoUpload(event) {
        const files = Array.from(event.target.files);
        photos = [...photos, ...files];
    }
</script>

<style>
    .completed {
        text-decoration: line-through;
    }
</style>

<h1>Task List</h1>
<ul>
    {#each tasks as task}
        <li>
            <input type="checkbox" bind:checked={task.completed} on:change={() => toggleTaskCompletion(task)} />
            <span class={task.completed ? 'completed' : ''}>{task.text}</span>
        </li>
    {/each}
</ul>

{#if tasks.some(task => task.completed)}
    <h2>Upload Photos</h2>
    <input type="file" multiple on:change={handlePhotoUpload} />
    <h3>Uploaded Photos:</h3>
    <ul>
        {#each photos as photo}
            <li>{photo.name}</li>
        {/each}
    </ul>
{/if}
