<script>
    import { account } from '$lib/appwrite';
    import "../app.css";
    import CircleUser from "lucide-svelte/icons/circle-user";
    import ChartLine from "lucide-svelte/icons/chart-line";
    import Package from "lucide-svelte/icons/package";
    import House from "lucide-svelte/icons/house";
    import ShoppingCart from "lucide-svelte/icons/shopping-cart";
    import Bell from "lucide-svelte/icons/bell";
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
      
     $: pathSegments = $page.url.pathname.split('/').filter(Boolean);
     let loggedInUser = {name: ''}
    
     // Add sheet open state store
     const sheetOpen = writable(false);
    
     // Function to close sheet
     const closeSheet = () => sheetOpen.set(false);
    
    onMount(async ()=>{
       try{
        loggedInUser = await account.get();
       } catch (error) {
               await account.createOAuth2Session(
                OAuthProvider.Oidc,   // provider
               'http://localhost:5173/offertes', // redirect here on success
               'http://localhost:5173/fail', // redirect here on failure
               //['openid', 'profile', 'email'] // scopes (optional)
              );
     } finally {
    
       const jwt = await account.createJWT();
       // Add JWT to cookies
    
       document.cookie = `appwriteJWT=${jwt.jwt}; path=/; max-age=3600; SameSite=Strict; Secure`;
     }
    
     })
    
    
       async function logout() {
           await account.deleteSession('current');
           loggedInUser = null;
           window.location.replace('/')
           alert('test')
       }
</script>
  

<div class="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
  <div class="bg-muted/40 hidden border-r md:block">
    <div class="flex h-full max-h-screen flex-col gap-2">
      <div class="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
        <a href="/" class="flex items-center gap-2 font-semibold">
          <Package2 class="h-6 w-6" />
          <span class="">{import.meta.env.VITE_BUSSINESS_NAME}</span>
        </a>
        <Button variant="outline" size="icon" class="ml-auto h-8 w-8">
          <Bell class="h-4 w-4" />
          <span class="sr-only">Toggle notifications</span>
        </Button>
      </div>
      <div class="flex-1">
        <nav class="grid items-start px-2 text-sm font-medium lg:px-4">
          <a
            href="/client"
            class="text-muted-foreground hover:text-primary flex items-center gap-3 rounded-lg px-3 py-2 transition-all"
          >
            <Users class="h-4 w-4" />
            Klanten
          </a>
          <a
            href="/project"
            class="text-muted-foreground hover:text-primary flex items-center gap-3 rounded-lg px-3 py-2 transition-all"
          >
            <ShoppingCart class="h-4 w-4" />
            Projecten
            <Badge
              class="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
            >
              6
            </Badge>
          </a>
          <a
            href="/diensten"
            class="bg-muted text-primary hover:text-primary flex items-center gap-3 rounded-lg px-3 py-2 transition-all"
          >
            <Package class="h-4 w-4" />
            Diensten
          </a>
          <a
            href="/agenda"
            class="text-muted-foreground hover:text-primary flex items-center gap-3 rounded-lg px-3 py-2 transition-all"
          >
            <Calendar class="h-4 w-4" />
            Agenda
          </a>
          <a
            href="##"
            class="text-muted-foreground hover:text-primary flex items-center gap-3 rounded-lg px-3 py-2 transition-all"
          >
            <ChartLine class="h-4 w-4" />
            Analytics
          </a>
        </nav>
      </div>
     
    </div>
  </div>
  <div class="flex flex-col">
    <header class="bg-muted/40 flex h-14 items-center gap-4 border-b px-4 lg:h-[60px] lg:px-6">
      <Sheet.Root>
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
              class="text-muted-foreground hover:text-foreground mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2"
            >
              <Users class="h-5 w-5" />
              Klanten
            </a>
            <a
              href="/project"
              class="bg-muted text-foreground hover:text-foreground mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2"
            >
              <ShoppingCart class="h-5 w-5" />
              Projecten
              <Badge
                class="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
              >
                6
              </Badge>
            </a>
            <a
              href="/diensten"
              class="text-muted-foreground hover:text-foreground mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2"
            >
              <Package class="h-5 w-5" />
              Diensten
            </a>
            <a
              href="/agenda"
              class="text-muted-foreground hover:text-foreground mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2"
            >
              <Calendar class="h-5 w-5" />
              Agenda
            </a>
            <a
              href="##"
              class="text-muted-foreground hover:text-foreground mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2"
            >
              <ChartLine class="h-5 w-5" />
              Analytics
            </a>
          </nav>
          
        </Sheet.Content>
      </Sheet.Root>
      <div class="w-full flex-1">
        <form>
          <div class="relative">
            <Search class="text-muted-foreground absolute left-2.5 top-2.5 h-4 w-4" />
            <Input
              type="search"
              placeholder="Search products..."
              class="bg-background w-full appearance-none pl-8 shadow-none md:w-2/3 lg:w-1/3"
            />
          </div>
        </form>
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
          <DropdownMenu.Item>Settings</DropdownMenu.Item>
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
