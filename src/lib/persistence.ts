import { get, set } from 'idb-keyval';
import type { Tab } from '../stores/tabs';

interface Persisted {
  tabs: Tab[];
  activeId: string | null;
}

const KEY = 'scratchpad-state-v1';

export async function saveTabs(state: Persisted): Promise<void> {
  // FileSystemFileHandle is structured-cloneable in IndexedDB (not via JSON)
  try {
    await set(KEY, {
      tabs: state.tabs.map((t) => ({
        id: t.id,
        kind: t.kind,
        title: t.title,
        content: t.content,
        dirty: t.dirty,
        fileHandle: t.fileHandle,
        filename: t.filename,
      })),
      activeId: state.activeId,
    });
  } catch (e) {
    console.warn('persist failed', e);
  }
}

export async function loadTabs(): Promise<Persisted | null> {
  try {
    const v = await get<Persisted>(KEY);
    return v ?? null;
  } catch {
    return null;
  }
}
