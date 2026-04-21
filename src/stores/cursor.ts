import { writable } from 'svelte/store';

export const cursor = writable<{ line: number; col: number }>({ line: 1, col: 1 });
