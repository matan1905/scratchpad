<script lang="ts">
  import { tabs, activeId, setActive, closeTab, newScratchTab, renameTab } from '../stores/tabs';
  import { pickAndOpenFile } from '../lib/fileHandlers';

  let renamingId = $state<string | null>(null);
  let renameValue = $state('');

  function focusMe(node: HTMLInputElement) {
    node.focus();
    node.select();
  }

  function startRename(id: string, title: string) {
    renamingId = id;
    renameValue = title;
  }

  function commitRename() {
    if (renamingId && renameValue.trim()) renameTab(renamingId, renameValue.trim());
    renamingId = null;
  }
</script>

<div class="tab-bar">
  <div class="tabs">
    {#each $tabs as t (t.id)}
      <div
        class="tab"
        class:active={t.id === $activeId}
        onclick={() => setActive(t.id)}
        ondblclick={() => startRename(t.id, t.title)}
        role="button"
        tabindex="0"
        onkeydown={(e) => { if (e.key === 'Enter') setActive(t.id); }}
      >
        {#if renamingId === t.id}
          <input
            class="tab-rename"
            bind:value={renameValue}
            onblur={commitRename}
            onkeydown={(e) => { if (e.key === 'Enter') commitRename(); if (e.key === 'Escape') renamingId = null; }}
            use:focusMe
          />
        {:else}
          <span class="tab-title" title={t.filename ?? t.title}>
            {t.dirty ? '●' : ''}
            {t.title}
          </span>
        {/if}
        <button
          class="tab-close"
          onclick={(e) => { e.stopPropagation(); closeTab(t.id); }}
          title="Close"
          aria-label="Close tab"
        >✕</button>
      </div>
    {/each}
  </div>
  <button class="icon-btn" onclick={() => newScratchTab()} title="New scratch (⌘N)" aria-label="New scratch">+</button>
  <button class="icon-btn" onclick={() => pickAndOpenFile()} title="Open file (⌘O)" aria-label="Open file">📂</button>
</div>

<style>
  .tab-bar {
    display: flex;
    background: var(--bg-secondary);
    border-bottom: 1px solid var(--border);
    min-height: 42px;
    align-items: center;
    padding: 4px 8px;
    gap: 2px;
    overflow-x: auto;
  }
  .tabs { display: flex; gap: 2px; flex: 1; min-width: 0; }
  .tab {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 10px;
    border-radius: 6px;
    color: var(--text-secondary);
    font-size: 13px;
    cursor: pointer;
    max-width: 200px;
    min-width: 90px;
    flex-shrink: 0;
  }
  .tab:hover { background: var(--tab-hover); color: var(--text-primary); }
  .tab.active { background: var(--bg-primary); color: var(--text-primary); }
  .tab-title {
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    text-align: left;
  }
  .tab-close {
    background: transparent;
    border: none;
    color: inherit;
    opacity: 0;
    cursor: pointer;
    padding: 2px 5px;
    border-radius: 3px;
    font-size: 11px;
  }
  .tab:hover .tab-close, .tab.active .tab-close { opacity: 0.7; }
  .tab-close:hover { background: var(--close-hover); color: white; opacity: 1; }
  .tab-rename {
    background: var(--bg-tertiary);
    border: 1px solid var(--accent);
    border-radius: 4px;
    color: var(--text-primary);
    font: inherit;
    padding: 2px 4px;
    outline: none;
    min-width: 60px;
    max-width: 160px;
  }
  .icon-btn {
    background: transparent;
    border: none;
    color: var(--text-secondary);
    font-size: 16px;
    width: 30px;
    height: 30px;
    border-radius: 6px;
    cursor: pointer;
  }
  .icon-btn:hover { background: var(--tab-hover); color: var(--text-primary); }
</style>
