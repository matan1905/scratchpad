import { writable, get } from 'svelte/store';
import { generateName } from '../lib/names';
import { saveTabs, loadTabs } from '../lib/persistence';

export type TabKind = 'scratch' | 'file';

export interface Tab {
  id: string;
  kind: TabKind;
  title: string;
  content: string;
  dirty: boolean;
  fileHandle?: FileSystemFileHandle;
  filename?: string;
}

export const tabs = writable<Tab[]>([]);
export const activeId = writable<string | null>(null);

let initialized = false;

export async function initTabs() {
  if (initialized) return;
  initialized = true;
  const stored = await loadTabs();
  if (stored && stored.tabs.length > 0) {
    tabs.set(stored.tabs);
    activeId.set(stored.activeId ?? stored.tabs[0].id);
  }
  tabs.subscribe((t) => {
    const ids = new Set(t.map((x) => x.id));
    const a = get(activeId);
    if (a && !ids.has(a)) activeId.set(t[0]?.id ?? null);
    saveTabs({ tabs: t, activeId: get(activeId) });
  });
  activeId.subscribe((a) => {
    saveTabs({ tabs: get(tabs), activeId: a });
  });
}

export function newScratchTab(): string {
  const id = crypto.randomUUID();
  const tab: Tab = {
    id,
    kind: 'scratch',
    title: generateName(),
    content: '',
    dirty: false,
  };
  tabs.update((t) => [...t, tab]);
  activeId.set(id);
  return id;
}

export function openFileTab(handle: FileSystemFileHandle, filename: string, content: string): string {
  const id = crypto.randomUUID();
  const tab: Tab = { id, kind: 'file', title: filename, content, dirty: false, fileHandle: handle, filename };
  tabs.update((t) => [...t, tab]);
  activeId.set(id);
  return id;
}

// Fallback without handle (e.g., drag-drop without FS Access API)
export function openReadOnlyFileTab(filename: string, content: string): string {
  const id = crypto.randomUUID();
  const tab: Tab = { id, kind: 'file', title: filename, content, dirty: false, filename };
  tabs.update((t) => [...t, tab]);
  activeId.set(id);
  return id;
}

export async function findTabByHandle(handle: FileSystemFileHandle): Promise<Tab | null> {
  const list = get(tabs);
  for (const t of list) {
    if (t.fileHandle && t.fileHandle.isSameEntry) {
      try {
        if (await t.fileHandle.isSameEntry(handle)) return t;
      } catch {}
    }
  }
  return null;
}

export function closeTab(id: string) {
  tabs.update((t) => t.filter((x) => x.id !== id));
}

export function setActive(id: string) {
  activeId.set(id);
}

export function updateContent(id: string, content: string) {
  tabs.update((t) =>
    t.map((x) => (x.id === id ? { ...x, content, dirty: x.content !== content ? true : x.dirty } : x))
  );
}

export function markClean(id: string) {
  tabs.update((t) => t.map((x) => (x.id === id ? { ...x, dirty: false } : x)));
}

export function renameTab(id: string, title: string) {
  tabs.update((t) => t.map((x) => (x.id === id ? { ...x, title } : x)));
}
