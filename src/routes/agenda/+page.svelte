<!-- <script>
import { selectedUser } from '../../stores/userStore.js';
import { onMount } from 'svelte';

let userDetails;
let notes = "We hebben je afspraak ingeplaned, je huidige status van je verzoek is in te zien via: portal.jhfbouw.nl/project/view/test"
onMount(() => {
    // Subscribe to selectedUser store
    const unsubscribe = selectedUser.subscribe(value => {
        userDetails = value;
        if (userDetails) {
            // Set details in the URL
            const { name, email } = userDetails;
            const url = `https://booking.toekomst.org/team/monteurs/dakdekken?&name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}&notes=${encodeURIComponent(notes)}`;
            document.querySelector('iframe').src = url;
        }
    });

    return () => unsubscribe(); // Cleanup subscription on component destroy
});
</script>

<iframe src="https://booking.toekomst.org/team/monteurs/dakdekken?&name=testie&email=test&notes={notes}" width="100%" height="100%" frameborder="0" allowfullscreen></iframe>
<iframe src="https://booking.toekomst.school/bookings/upcoming" width="100%" height="100%" frameborder="0" allowfullscreen></iframe> -->



<!-- <iframe src="https://booking.toekomst.org/team/monteurs" width="100%" height="100%" frameborder="0" allowfullscreen></iframe> -->

<script>
  import { onMount } from "svelte";
  import { selectedUser } from "../../stores/userStore.js";
  import { goto } from "$app/navigation";

  let userDetails = null;
  let availableSlots = [];
  let selectedSlot = null;
  let loading = false;
  let error = "";

  // Replace the URL & response mapping as required by your cal.com instance.
  async function fetchAvailableSlots(userId) {
    loading = true;
    error = "";
    try {
      // Example API endpoint – change 'your-cal-instance.com' to your cal.com domain.
      const res = await fetch(`https://your-cal-instance.com/api/availability?userId=${userId}`);
      if (!res.ok) {
        throw new Error("Failed to fetch available slots");
      }
      const data = await res.json();
      // Assume the API returns an object with a `slots` array.
      availableSlots = data.slots || [];
    } catch (err) {
      console.error(err);
      error = "Error loading available slots.";
    } finally {
      loading = false;
    }
  }

  onMount(() => {
    const unsubscribe = selectedUser.subscribe(value => {
      userDetails = value;
      if (userDetails && userDetails.id) {
        // Fetch available slots using the user ID (adjust according to your user model)
        fetchAvailableSlots(userDetails.id);
      }
    });
    return () => unsubscribe();
  });

  // Slot selection handler – simply store the selected slot
  function selectSlot(slot) {
    selectedSlot = slot;
  }

  async function bookSlot() {
    if (!selectedSlot) return;
    try {
      // Send a booking request to the cal.com API.
      // Adjust the endpoint and payload as needed for your cal.com setup.
      const response = await fetch(`https://your-cal-instance.com/api/book`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          userId: userDetails.id,
          slotId: selectedSlot.id
        })
      });
      const result = await response.json();
      if (result.success) {
        alert("Slot booked successfully!");
        // Optionally, navigate to a confirmation page:
        // goto('/booking-confirmation');
      } else {
        alert("Booking failed. Please try again.");
      }
    } catch (e) {
      console.error(e);
      alert("An error occurred while booking the slot.");
    }
  }
</script>

<div>
  {#if loading}
    <p>Loading available slots...</p>
  {:else if error}
    <p>{error}</p>
  {:else}
    {#if availableSlots.length > 0}
      <h2>Available Slots</h2>
      <ul>
        {#each availableSlots as slot}
          <li
            on:click={() => selectSlot(slot)}
            style="
              cursor: pointer;
              padding: 8px;
              border: 1px solid #ccc;
              margin-bottom: 4px;
              background-color: {selectedSlot && selectedSlot.id === slot.id ? '#e0e0e0' : 'white'};
            "
          >
            <strong>Date:</strong> {slot.date} &mdash;
            <strong>Time:</strong> {slot.startTime} to {slot.endTime}
          </li>
        {/each}
      </ul>
    {:else}
      <p>No available slots found.</p>
    {/if}
  {/if}
</div>

{#if selectedSlot}
  <div style="margin-top: 16px;">
    <p>
      You selected: <strong>{selectedSlot.date}</strong> from <strong>{selectedSlot.startTime}</strong> to <strong>{selectedSlot.endTime}</strong>
    </p>
    <button on:click={bookSlot}>Book this slot</button>
  </div>
{/if}


