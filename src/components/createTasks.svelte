<script>
    export let tasks;
    let newTaskTitle = '';


       console.log(tasks)
 

    function addTask() {
        if (newTaskTitle.trim()) {
            tasks = [...tasks, newTaskTitle];
            newTaskTitle = '';
        }
    }

    function deleteTask(index) {
        tasks = tasks.filter((_, i) => i !== index);
    }

    function updateTask(index, newTask) {
        tasks[index].task = newTask;
        tasks = [...tasks]; // trigger reactivity
    }
</script>

<div class="task-container">
    <h2>Taken</h2>
    
    <!-- Existing tasks list -->
    {#each tasks as task, index}
        <div class="task-item">
            <input
                type="text"
                bind:value={task}
                on:change={() => updateTask(index, task)}
            />
            <a on:click={() => deleteTask(index)}>x</a>
        </div>
    {/each}

    <!-- Add new task -->
    <div class="add-task">
        <input
            type="text"
            placeholder="Nieuwe taak"
            bind:value={newTaskTitle}
            on:keypress={(e) => e.key === 'Enter' && addTask()}
        />
        <button on:click={addTask}>Toevoegen</button>
    </div>
</div>

<style>
    .task-container {
        max-width: 600px;
        margin: 20px auto;
    }

    .task-item {
        display: flex;
        gap: 10px;
        margin: 10px 0;
    }

    .add-task {
        margin-top: 20px;
        display: flex;
        gap: 10px;
    }

    input {
        flex: 1;
        padding: 8px;
    }

    button {
        padding: 8px 16px;
        background-color: #4CAF50;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
    }

    button:hover {
        background-color: #45a049;
    }
</style>
