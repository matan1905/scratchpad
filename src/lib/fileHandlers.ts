import { get } from 'svelte/store';
import {
  openFileTab,
  openReadOnlyFileTab,
  findTabByHandle,
  setActive,
  markClean,
  closeTab,
  tabs,
  activeId,
} from '../stores/tabs';

const MAX_BINARY_SNIFF = 8192;

function looksBinary(text: string): boolean {
  const len = Math.min(text.length, MAX_BINARY_SNIFF);
  for (let i = 0; i < len; i++) {
    if (text.charCodeAt(i) === 0) return true;
  }
  return false;
}

export async function openHandle(handle: FileSystemFileHandle): Promise<void> {
  const existing = await findTabByHandle(handle);
  if (existing) {
    setActive(existing.id);
    return;
  }
  const file = await handle.getFile();
  const text = await file.text();
  if (looksBinary(text)) {
    alert(`"${handle.name}" looks binary — not opening.`);
    return;
  }
  openFileTab(handle, handle.name, text);
}

export async function pickAndOpenFile(): Promise<void> {
  if (!('showOpenFilePicker' in window)) {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.onchange = async () => {
      for (const f of Array.from(input.files ?? [])) {
        const text = await f.text();
        if (looksBinary(text)) {
          alert(`"${f.name}" looks binary — skipping.`);
          continue;
        }
        openReadOnlyFileTab(f.name, text);
      }
    };
    input.click();
    return;
  }
  try {
    const handles = await (window as any).showOpenFilePicker({ multiple: true });
    for (const h of handles as FileSystemFileHandle[]) {
      await openHandle(h);
    }
  } catch (e: any) {
    if (e?.name !== 'AbortError') console.error(e);
  }
}

async function ensureWritePermission(handle: FileSystemFileHandle): Promise<boolean> {
  if (!handle.queryPermission || !handle.requestPermission) return true;
  const q = await handle.queryPermission({ mode: 'readwrite' });
  if (q === 'granted') return true;
  const r = await handle.requestPermission({ mode: 'readwrite' });
  return r === 'granted';
}

export async function saveActive(): Promise<void> {
  const aid = get(activeId);
  const tab = get(tabs).find((t) => t.id === aid);
  if (!tab) return;

  if (tab.fileHandle) {
    const ok = await ensureWritePermission(tab.fileHandle);
    if (!ok) return;
    const w = await (tab.fileHandle as any).createWritable();
    await w.write(tab.content);
    await w.close();
    markClean(tab.id);
    return;
  }

  if ('showSaveFilePicker' in window) {
    try {
      const handle: FileSystemFileHandle = await (window as any).showSaveFilePicker({
        suggestedName: tab.filename ?? tab.title,
      });
      const w = await (handle as any).createWritable();
      await w.write(tab.content);
      await w.close();
      tabs.update((list) =>
        list.map((x) =>
          x.id === tab.id
            ? { ...x, kind: 'file', fileHandle: handle, filename: handle.name, title: handle.name, dirty: false }
            : x
        )
      );
    } catch (e: any) {
      if (e?.name !== 'AbortError') console.error(e);
    }
  } else {
    const blob = new Blob([tab.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = tab.filename ?? `${tab.title}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    markClean(tab.id);
  }
}

export function closeActive(): void {
  const aid = get(activeId);
  if (aid) closeTab(aid);
}

export function initFileHandlers(): void {
  if ('launchQueue' in window && window.launchQueue) {
    window.launchQueue.setConsumer(async (params) => {
      for (const handle of params.files ?? []) {
        if ((handle as any).kind === 'file') await openHandle(handle);
      }
    });
  }

  window.addEventListener('dragover', (e) => e.preventDefault());
  window.addEventListener('drop', async (e) => {
    e.preventDefault();
    if (!e.dataTransfer) return;
    const items = Array.from(e.dataTransfer.items);
    for (const it of items) {
      if (it.kind !== 'file') continue;
      const getAsFSH = (it as any).getAsFileSystemHandle?.bind(it);
      if (getAsFSH) {
        const h = await getAsFSH();
        if (h && h.kind === 'file') {
          await openHandle(h as FileSystemFileHandle);
          continue;
        }
      }
      const f = it.getAsFile();
      if (!f) continue;
      const text = await f.text();
      if (looksBinary(text)) {
        alert(`"${f.name}" looks binary — skipping.`);
        continue;
      }
      openReadOnlyFileTab(f.name, text);
    }
  });
}
