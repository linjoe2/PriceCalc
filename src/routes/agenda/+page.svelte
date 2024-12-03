<script>
import { selectedUser } from '../../stores/userStore.js';
import { onMount } from 'svelte';

let userDetails;

onMount(() => {
    // Subscribe to selectedUser store
    const unsubscribe = selectedUser.subscribe(value => {
        userDetails = value;
        if (userDetails) {
            // Set details in the URL
            const { name, email } = userDetails;
            const url = `https://booking.toekomst.org/team/monteurs/dakdekken?&name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}&notes=test`;
            document.querySelector('iframe').src = url;
        }
    });

    return () => unsubscribe(); // Cleanup subscription on component destroy
});
</script>

<iframe src="https://booking.toekomst.org/team/monteurs/dakdekken?&name=testie&email=test&notes=test" width="100%" height="100%" frameborder="0" allowfullscreen></iframe>
<!-- <iframe src="https://booking.toekomst.school/bookings/upcoming" width="100%" height="100%" frameborder="0" allowfullscreen></iframe> -->
