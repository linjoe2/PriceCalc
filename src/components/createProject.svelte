<script lang="ts">
    import { onMount } from 'svelte';
    import { Databases, ID, Query } from "appwrite";
    import { client, account } from "$lib/appwrite";
    import { selectedUser } from "../stores/userStore";
    import { goto } from '$app/navigation';
    import ClientSearch from './ClientSearch.svelte';
    import type { Client } from '$lib/types';
    import * as Dialog from "$lib/components/ui/dialog";

    export let isOpen = false;

    const databases = new Databases(client);
    const databaseId = 'PriceCalc';
    const projectsCollectionId = '67362a9400133ceb48ac';

    let projectNumber = '';
    let isCreating = false;

    onMount(async () => {
        try {
            // Fetch all projects to determine the next project number
            const projectsResponse = await databases.listDocuments(
                databaseId, 
                projectsCollectionId,
                [Query.orderDesc('projectNumber'), Query.limit(1)]
            );
            
            const currentYear = new Date().getFullYear();
            let counter = 1;
            
            if (projectsResponse.documents.length > 0) {
                const lastProject = projectsResponse.documents[0];
                const lastProjectNumber = lastProject.projectNumber || '';
                if (lastProjectNumber.startsWith(currentYear.toString())) {
                    counter = parseInt(lastProjectNumber.slice(4)) + 1;
                }
            }
            
            // Format: YYYY001, YYYY002, etc.
            projectNumber = `${currentYear}${counter.toString().padStart(3, '0')}`;
        } catch (error) {
            console.error('Error:', error);
        }
    });

    async function createProject() {
        if (!$selectedUser) return;
        
        isCreating = true;
        try {
            let loggedInUser = await account.get();
            const projectData = {
                projectNumber,
                items: JSON.stringify([]),
                projects: JSON.stringify([]),
                client: $selectedUser.$id,
                fase: "opstellen offerte",
                terms: JSON.stringify([]),
                tasks: [],
                opmerkingen: "",
                notities: "",
                uploadedImages: [],
                paymentSchedule: JSON.stringify({
                    initial: 50,
                    during: 45,
                    final: 5
                }),
                createdAt: new Date().toISOString(),
                createdBy: `${loggedInUser.name}`,
                updatedAt: new Date().toISOString(),
                lastUpdatedBy: `${loggedInUser.name}`,
                search: [
                    projectNumber,
                    $selectedUser?.adress,
                    $selectedUser?.huisnummer,
                    $selectedUser?.postcode,
                    $selectedUser?.woonplaats
                ].filter(Boolean).join(' ').toLowerCase()
            };

            const response = await databases.createDocument(
                databaseId,
                projectsCollectionId,
                ID.unique(),
                projectData
            );

            isOpen = false;
            goto('/project/view/' + response.$id);
        } catch (error) {
            console.error('Error creating project:', error);
        } finally {
            isCreating = false;
        }
    }
</script>

<Dialog.Root bind:open={isOpen}>
    <Dialog.Content class="sm:max-w-[425px]">
        <Dialog.Header>
            <Dialog.Title>Nieuw Project Aanmaken</Dialog.Title>
            <Dialog.Description>
                Selecteer een klant om een nieuw project aan te maken.
            </Dialog.Description>
        </Dialog.Header>

        <div class="grid gap-4 py-4">
            <div class="mb-4">
                <ClientSearch />
            </div>

            {#if $selectedUser}
                <div class="bg-gray-50 p-4 rounded-lg">
                    <h3 class="font-medium mb-2">Project Details</h3>
                    <p class="text-sm text-gray-600">Projectnummer: {projectNumber}</p>
                    <p class="text-sm text-gray-600">Klant: {$selectedUser.businessname || $selectedUser.name}</p>
                </div>
            {/if}
        </div>

        <Dialog.Footer>
            <button
                class="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
                on:click={createProject}
                disabled={!$selectedUser || isCreating}
            >
                {isCreating ? 'Project aanmaken...' : 'Project Aanmaken'}
            </button>
        </Dialog.Footer>
    </Dialog.Content>
</Dialog.Root> 