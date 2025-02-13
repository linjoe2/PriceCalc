import { writable, type Writable } from 'svelte/store';
import type { Client } from '$lib/types';

export const selectedUser: Writable<Client | null> = writable(null);

export const chatwootContact: Writable<Client | null> = writable(null);
