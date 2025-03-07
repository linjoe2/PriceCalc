<script>
    export let tasks;
    let newTaskTitle = '';
    let draggedIndex = null;

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

    function handleDragStart(event, index) {
        draggedIndex = index;
        event.dataTransfer.effectAllowed = 'move';
        // Add a class to the dragged item for visual feedback
        event.target.closest('.task-item').classList.add('dragging');
    }

    function handleDragEnd(event) {
        event.target.closest('.task-item').classList.remove('dragging');
        draggedIndex = null;
    }

    function handleDragOver(event, index) {
        event.preventDefault();
        if (draggedIndex === null || draggedIndex === index) return;
        
        // Reorder the tasks array
        const tasksArray = [...tasks];
        const draggedTask = tasksArray[draggedIndex];
        tasksArray.splice(draggedIndex, 1);
        tasksArray.splice(index, 0, draggedTask);
        tasks = tasksArray;
        draggedIndex = index;
    }
</script>

<div class="task-container">
    <h2>Taken</h2>
    
    <!-- Existing tasks list -->
    {#each tasks as task, index}
        <div 
            class="task-item"
            draggable="true"
            on:dragstart={(e) => handleDragStart(e, index)}
            on:dragend={handleDragEnd}
            on:dragover={(e) => handleDragOver(e, index)}
        >
            <span class="drag-handle">•</span>
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
        padding: 5px;
        background: white;
        border-radius: 4px;
        border: 1px solid transparent;
    }

    .task-item.dragging {
        opacity: 0.5;
        border: 1px dashed #666;
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

    .drag-handle {
        cursor: grab;
        padding: 0 8px;
        font-size: 20px;
        display: flex;
        align-items: center;
        color: #666;
    }

    .drag-handle:active {
        cursor: grabbing;
    }
</style>
