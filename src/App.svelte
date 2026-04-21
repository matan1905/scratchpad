<script lang="ts">
  import { onMount } from 'svelte';
  import TabBar from './components/TabBar.svelte';
  import Editor from './components/Editor.svelte';
  import { tabs, activeId, initTabs, newScratchTab } from './stores/tabs';
  import { initFileHandlers, saveActive, pickAndOpenFile, closeActive } from './lib/fileHandlers';

  let online = $state(navigator.onLine);

  onMount(async () => {
    await initTabs();
    initFileHandlers();

    window.addEventListener('online', () => (online = true));
    window.addEventListener('offline', () => (online = false));

    window.addEventListener('keydown', (e) => {
      const mod = e.metaKey || e.ctrlKey;
      if (!mod) return;
      if (e.key.toLowerCase() === 'n') { e.preventDefault(); newScratchTab(); }
      else if (e.key.toLowerCase() === 'o') { e.preventDefault(); pickAndOpenFile(); }
      else if (e.key.toLowerCase() === 's') { e.preventDefault(); saveActive(); }
      else if (e.key.toLowerCase() === 'w') { e.preventDefault(); closeActive(); }
    });
  });

  const active = $derived($tabs.find((t) => t.id === $activeId) ?? null);
  const charCount = $derived(active?.content.length ?? 0);
  const lineCount = $derived(active ? active.content.split('\n').length : 0);
</script>

<TabBar />

<div class="editor-area">
  {#if active}
    {#key active.id}
      <Editor tab={active} />
    {/key}
  {:else}
    <div class="empty">
      <p>Press <kbd>⌘N</kbd> for new scratch, <kbd>⌘O</kbd> to open a file, or drop files here</p>
    </div>
  {/if}
</div>

<div class="status-bar">
  <div class="left">
    <span>{$tabs.length} tab{$tabs.length === 1 ? '' : 's'}</span>
    <span class="dot" class:offline={!online}></span>
    <span>{online ? 'Online' : 'Offline'}</span>
  </div>
  <div class="right">
    {#if active}
      <span>{lineCount} lines</span>
      <span>{charCount} chars</span>
      {#if active.dirty}<span class="dirty">● unsaved</span>{/if}
    {/if}
  </div>
</div>

<style>
  .editor-area { flex: 1; display: flex; overflow: hidden; }
  .empty {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-muted);
    padding: 24px;
    text-align: center;
  }
  .status-bar {
    display: flex;
    justify-content: space-between;
    padding: 6px 16px;
    background: var(--bg-secondary);
    border-top: 1px solid var(--border);
    font-size: 12px;
    color: var(--text-secondary);
  }
  .left, .right { display: flex; gap: 14px; align-items: center; }
  .dot {
    width: 8px; height: 8px; border-radius: 50%;
    background: #4ade80;
    display: inline-block;
  }
  .dot.offline { background: #f59e0b; }
  .dirty { color: var(--dirty); }
</style>
