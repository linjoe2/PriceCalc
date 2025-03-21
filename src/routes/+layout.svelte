<script lang="ts">
    import { account } from '$lib/appwrite';
    import "../app.css";
    import CircleUser from "lucide-svelte/icons/circle-user";
    import ChartLine from "lucide-svelte/icons/chart-line";
    import Droplet from "lucide-svelte/icons/droplet";
    import Package from "lucide-svelte/icons/package";
    import House from "lucide-svelte/icons/house";
    import ShoppingCart from "lucide-svelte/icons/shopping-cart";
    import Plus from "lucide-svelte/icons/plus";
    import Menu from "lucide-svelte/icons/menu";
    import Calendar from "lucide-svelte/icons/calendar"
    import Package2 from "lucide-svelte/icons/package-2";
    import Search from "lucide-svelte/icons/search";
    import Users from "lucide-svelte/icons/users";
    import { Badge } from "$lib/components/ui/badge/index.js";
    import { Button } from "$lib/components/ui/button/index.js";
    import * as Card from "$lib/components/ui/card/index.js";
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
    import { Input } from "$lib/components/ui/input/index.js";
    import * as Sheet from "$lib/components/ui/sheet/index.js";
    import { OAuthProvider } from "appwrite";
    import {onMount} from "svelte";
    import { writable } from 'svelte/store';
    import { page } from '$app/stores';
    // import UserSearch from './userSearch.svelte'
    import { derived } from 'svelte/store';
    import { chatwootContact } from "../stores/userStore";
    import FileText from "lucide-svelte/icons/file-text";

    $: pathSegments = $page.url.pathname.split('/').filter(Boolean);
    interface LoggedInUser {
        name: string;
        labels: string[];
        [key: string]: any; // For any additional properties from Appwrite
    }

    let loggedInUser: LoggedInUser = {name: '', labels: []};
    let activeRoute = ''
    // Add sheet open state store
    const sheetOpen = writable(false);
    
    // Function to close sheet
    const closeSheet = () => sheetOpen.set(false);
    
    // Create a derived store to determine the active route
    $: activeRoute = pathSegments[0];
    $: console.log(activeRoute)

    
    onMount(async ()=>{
       try{
        loggedInUser = await account.get();
        console.log('loggedInUser', loggedInUser)
       } catch (error) {
               await account.createOAuth2Session(
                OAuthProvider.Oidc,   // provider
                import.meta.env.VITE_URL, // redirect here on success
               import.meta.env.VITE_URL + '/fail', // redirect here on failure
               ['openid', 'profile', 'email', 'account'] // scopes (optional)
              );
     } finally {
      console.log('test')
      console.log(loggedInUser)
       const jwt = await account.createJWT();
       console.log('jwt', jwt)
       // Add JWT to cookies
    
       document.cookie = `appwriteJWT=${jwt.jwt}; path=/; max-age=3600; SameSite=Strict; Secure`;
     }
     window.parent.postMessage('chatwoot-dashboard-app:fetch-info', '*')
    
     })

     
    
    
       async function logout() {
           await account.deleteSession('current');
           loggedInUser = {name: '', labels: []};
           window.location.replace('/')
           alert('test')
       }
    
    let showNewItemMenu = false; // State to manage the visibility of the new item menu

    // Function to toggle the new item menu
    const toggleNewItemMenu = () => {
        showNewItemMenu = !showNewItemMenu;
    };

    // Function to check if the user is an admin
    function isAdmin() {
        return loggedInUser.labels.includes('admin');
    }

    //chatwoot recieve client data
 
   function handleMessage(event: MessageEvent) {
        console.log('chatwoot.event', event);
        const eventData = JSON.parse(event.data);
        console.log('chatwoot.eventData', eventData);
        if(eventData.event == "appContext"){
          $chatwootContact = eventData.data.contact;
          // check if user exists in database
//          const user = await database.listDocuments('users', [Query.equal('email', chatwootContact.email)]);
          console.log('user', $chatwootContact);
        }
    }
</script>
  
<svelte:window on:message={handleMessage} />

 <div class="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
  <div class="bg-muted/40 hidden border-r md:block z-30">
    <div class="flex h-full max-h-screen flex-col gap-2">
      <div class="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
        <a href="/" class="flex items-center gap-2 font-semibold">
          <Package2 class="h-6 w-6" />
          <span class="">{import.meta.env.VITE_BUSSINESS_NAME}</span>
        </a>
        <div class="relative ml-auto h-8 w-8">
          <Button variant="outline" size="icon" class="h-8 w-8" on:click={toggleNewItemMenu}>
            <Plus class="h-4 w-4" />
            <span class="sr-only">Nieuwe item</span>
          </Button>
          {#if showNewItemMenu} <!-- Conditional rendering of the menu -->
            <div class="absolute right-0 mt-2 w-56 origin-top-right rounded-md shadow-lg">
              <div class="rounded-md bg-white shadow-xs">
                <div class="py-1">
                  <a href="/client/new" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Klant</a>
                  <a href="/project/edit/new" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Project</a>
                  <!-- <a href="/agenda" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Afspraak</a> -->
                </div>
              </div>
            </div>
          {/if}
        </div>
      </div>
      <div class="flex-1 flex flex-col">
        <nav class="grid items-start px-2 text-sm font-medium lg:px-4">
          <a
            href="/client"
            class={`text-muted-foreground hover:text-primary flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${activeRoute === 'client' ? 'bg-primary text-white' : 'hover:bg-primary'}`}
          >
            <Users class="h-4 w-4" />
            Klanten
          </a>
          <a
            href="/project"
            class={`text-muted-foreground hover:text-primary flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${activeRoute === 'project' ? 'bg-primary text-white' : 'hover:bg-primary'}`}
          >
            <ShoppingCart class="h-4 w-4" />
            Projecten
            <!-- <Badge
              class="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
            >
              6
            </Badge> -->
          </a>
          <!-- <a
            href="/agenda"
            class={`text-muted-foreground hover:text-primary flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${activeRoute === 'agenda' ? 'bg-primary text-white' : 'hover:bg-primary'}`}
          >
            <Calendar class="h-4 w-4" />
            Agenda
          </a> -->
          <a
            href="/daklekkages"
            class={`text-muted-foreground hover:text-primary flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${activeRoute === 'daklekkages' ? 'bg-primary text-white' : 'hover:bg-primary'}`}
          >
            <Droplet class="h-4 w-4" />
            Daklekkages
          </a>
          <a
            href="/work"
            class={`text-muted-foreground hover:text-primary flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${activeRoute === '/work' ? 'bg-primary text-white' : 'hover:bg-primary'}`}
          >
            <ChartLine class="h-4 w-4" />
            Werkbonnen
          </a>
        </nav>
        
        <!-- Add bottom links for desktop menu -->
        <div class="mt-auto border-t px-2 pt-2 lg:px-4">
          <a
            href="/item"
            class={`text-muted-foreground hover:text-primary flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${activeRoute === 'item' ? 'bg-primary text-white' : 'hover:bg-primary'}`}
          >
            <Package class="h-4 w-4" />
            Diensten
          </a>
          <a
            href="/terms"
            class={`text-muted-foreground hover:text-primary flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${activeRoute === 'terms' ? 'bg-primary text-white' : 'hover:bg-primary'}`}
          >
            <FileText class="h-4 w-4" />
            Voorwaarden
          </a>
        </div>
      </div>
    </div>
  </div>
  <div class="flex flex-col">
    <header class="bg-muted/40 flex h-14 items-center gap-4 border-b px-4 lg:h-[60px] lg:px-6 z-30">
      <Sheet.Root bind:open={$sheetOpen}>
        <Sheet.Trigger asChild let:builder>
          <Button
            variant="outline"
            size="icon"
            class="shrink-0 md:hidden"
            builders={[builder]}
          >
            <Menu class="h-5 w-5" />
            <span class="sr-only">Toggle navigation menu</span>
          </Button>
        </Sheet.Trigger>
        <Sheet.Content side="left" class="flex flex-col">
          <nav class="grid gap-2 text-lg font-medium">
            <a href="/" class="flex items-center gap-2 text-lg font-semibold">
              <Package2 class="h-6 w-6" />
              <span class="sr-only">Acme Inc</span>
            </a>
            <a
              href="/client"
              on:click={closeSheet}
              class={`text-muted-foreground hover:text-primary flex items-center gap-4 rounded-xl px-3 py-2 ${activeRoute === 'client' ? 'bg-primary text-white' : 'hover:bg-primary'}`}
            >
              <Users class="h-5 w-5" />
              Klanten
            </a>
            <a
              href="/project"
              on:click={closeSheet}
              class={`text-muted-foreground hover:text-primary flex items-center gap-4 rounded-xl px-3 py-2 ${activeRoute === 'project' ? 'bg-primary text-white' : 'hover:bg-primary'}`}
            >
              <ShoppingCart class="h-5 w-5" />
              Projecten
            </a>
            <!-- <a
              href="/agenda"
              on:click={closeSheet}
              class={`text-muted-foreground hover:text-primary flex items-center gap-4 rounded-xl px-3 py-2 ${activeRoute === 'agenda' ? 'bg-primary text-white' : 'hover:bg-primary'}`}
            >
              <Calendar class="h-5 w-5" />
              Agenda
            </a> -->
            <a
              href="/Daklekkages"
              on:click={closeSheet}
              class={`text-muted-foreground hover:text-primary flex items-center gap-4 rounded-xl px-3 py-2 ${activeRoute === 'Daklekkages' ? 'bg-primary text-white' : 'hover:bg-primary'}`}
            >
              <Droplet class="h-5 w-5" />
              Daklekkages
            </a>
            <a
              href="/work"
              on:click={closeSheet}
              class={`text-muted-foreground hover:text-primary flex items-center gap-4 rounded-xl px-3 py-2 ${activeRoute === 'work' ? 'bg-primary text-white' : 'hover:bg-primary'}`}
            >
              <ChartLine class="h-5 w-5" />
              Werkbonnen
            </a>
          </nav>
          
          <!-- Add this new div for bottom links -->
          <div class="mt-auto border-t pt-2">
            <a
              href="/item"
              on:click={closeSheet}
              class={`text-muted-foreground hover:text-primary flex items-center gap-4 rounded-xl px-3 py-2 ${activeRoute === 'item' ? 'bg-primary text-white' : 'hover:bg-primary'}`}
            >
              <Package class="h-5 w-5" />
              Diensten
            </a>
            <a
              href="/terms"
              on:click={closeSheet}
              class={`text-muted-foreground hover:text-primary flex items-center gap-4 rounded-xl px-3 py-2 ${activeRoute === 'terms' ? 'bg-primary text-white' : 'hover:bg-primary'}`}
            >
              <FileText class="h-5 w-5" />
              Voorwaarden
            </a>
          </div>
        </Sheet.Content>
      </Sheet.Root>
      <div class="w-full flex-1">
        <!-- <UserSearch /> -->
      </div>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild let:builder>
          <Button
            builders={[builder]}
            variant="secondary"
            size="icon"
            class="rounded-full"
          >
            <CircleUser class="h-5 w-5" />
            <span class="sr-only">Toggle user menu</span>
          </Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content align="end">
          <DropdownMenu.Label>My Account</DropdownMenu.Label>
          <DropdownMenu.Separator />
          <DropdownMenu.Item><a href="/settings">Instellingen</a></DropdownMenu.Item>
          <DropdownMenu.Item>Support</DropdownMenu.Item>
          <DropdownMenu.Separator />
          <DropdownMenu.Item>Logout</DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    </header>
    <main class="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
       <slot />
   </main>
  </div>
</div>
