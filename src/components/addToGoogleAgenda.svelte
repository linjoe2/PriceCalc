<script>
   import flatpickr from "flatpickr";
   import "flatpickr/dist/flatpickr.css";

   export let projectData;
   let showModal = false;
   let selectedDate = '';

   function addToGoogleAgenda() {
       const startDateTime = new Date(`${projectData.startDate}T06:00:00Z`).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
       const endDateTime = new Date(`${projectData.startDate}T15:00:00Z`).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

       // Organize tasks by category and subcategory
       const tasksByCategory = projectData.items.reduce((acc, item) => {
           const category = item.category;
           const subcategory = item.subcategory;
           if (!acc[category]) acc[category] = {};
           if (!acc[category][subcategory]) acc[category][subcategory] = [];
           acc[category][subcategory].push(...item.tasks.map(task => task.description));
           return acc;
       }, {});

       // Format tasks with HTML
       const formattedTasks = Object.entries(tasksByCategory).map(([category, subcategories]) => {
           const subcategoryTasks = Object.entries(subcategories).map(([subcategory, tasks]) => {
               return `<strong>${subcategory}:</strong> <ul>${tasks.map(task => `<li>${task}</li>`).join('')}</ul>`;
           }).join('');
           return `<strong>${category}:</strong> ${subcategoryTasks}`;
       }).join('');

       // Format terms
       const formattedTerms = projectData.terms.map(term => term.text).join('<br>');

       // Create details string with HTML
       const details = `${formattedTasks}<br><b>Voorwaarden:</b><br>${formattedTerms}`;

       window.open(`https://www.google.com/calendar/render?action=TEMPLATE&text=O${projectData.projectNumber}&dates=${startDateTime}/${endDateTime}&details=${encodeURIComponent(details)}&location=${projectData.client.adress} ${projectData.client.huisnummer} ${projectData.client.postcode} ${projectData.client.woonplaats}`, '_blank');
   }

   function openModal() {
       showModal = true;
       setTimeout(() => {
           flatpickr("#datePicker", {
               onChange: (selectedDates) => {
                   const date = new Date(selectedDates[0]);
                   date.setDate(date.getDate() + 1);
                   selectedDate = date.toISOString().split('T')[0];
                   projectData.startDate = selectedDate;
                   console.log(selectedDate);
                   addToGoogleAgenda();
               },
               inline: true,
               "locale": {
                   "firstDayOfWeek": 1 // start week on Monday
               }
           });
       }, 0);
   }

   function closeModal() {
       showModal = false;
   }

   function saveDate() {
       projectData.startDate = selectedDate;
       closeModal();
       addToGoogleAgenda();
   }

   function handleOutsideClick(event) {
       closeModal();
   }
</script>

<button class="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-black rounded-md shadow-sm text-sm font-medium  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
    <a on:click={openModal}>
        Agenda inplannen
    </a>
</button>

{#if showModal}
<div class="modal" on:click={handleOutsideClick}>
    <div class="modal-content" on:click|stopPropagation>
        <input id="datePicker" type="text" placeholder="Select Date" />
    </div>
</div>
{/if}

<style>
    .modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .modal-content {
        background-color: white;
        padding: 20px;
        border-radius: 5px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }
</style>