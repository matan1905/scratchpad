<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { EditorState, Compartment } from '@codemirror/state';
  import { EditorView, keymap, lineNumbers, highlightActiveLine, highlightActiveLineGutter, drawSelection } from '@codemirror/view';
  import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
  import { bracketMatching, indentOnInput, foldGutter, foldKeymap } from '@codemirror/language';
  import { languageFromFilename, isProseFile } from '../lib/language';
  import { bidiAutoLines } from '../lib/direction';
  import type { Tab } from '../stores/tabs';
  import { updateContent } from '../stores/tabs';

  let { tab }: { tab: Tab } = $props();

  let el: HTMLDivElement;
  let view: EditorView | null = null;
  const langCompartment = new Compartment();
  const dirCompartment = new Compartment();

  let lastTabId: string | null = null;

  function buildLangExt(t: Tab) {
    const ext = t.filename ? languageFromFilename(t.filename) : null;
    return ext ? [ext] : [];
  }

  function buildDirExt(t: Tab) {
    // Prose / scratch → per-line auto-detect; code files → LTR forced (no decoration)
    if (t.kind === 'scratch' || !t.filename || isProseFile(t.filename)) {
      return [bidiAutoLines];
    }
    return [];
  }

  function rebuildFor(t: Tab) {
    if (!view) return;
    view.dispatch({
      effects: [
        langCompartment.reconfigure(buildLangExt(t)),
        dirCompartment.reconfigure(buildDirExt(t)),
      ],
    });
    if (view.state.doc.toString() !== t.content) {
      view.dispatch({
        changes: { from: 0, to: view.state.doc.length, insert: t.content },
      });
    }
  }

  onMount(() => {
    const startState = EditorState.create({
      doc: tab.content,
      extensions: [
        lineNumbers(),
        highlightActiveLine(),
        highlightActiveLineGutter(),
        drawSelection(),
        history(),
        bracketMatching(),
        indentOnInput(),
        foldGutter(),
        EditorView.lineWrapping,
        keymap.of([...defaultKeymap, ...historyKeymap, ...foldKeymap, indentWithTab]),
        langCompartment.of(buildLangExt(tab)),
        dirCompartment.of(buildDirExt(tab)),
        EditorView.updateListener.of((u) => {
          if (u.docChanged) {
            updateContent(tab.id, u.state.doc.toString());
          }
        }),
      ],
    });
    view = new EditorView({ state: startState, parent: el });
    lastTabId = tab.id;
  });

  $effect(() => {
    if (!view) return;
    if (tab.id !== lastTabId) {
      rebuildFor(tab);
      lastTabId = tab.id;
    } else if (view.state.doc.toString() !== tab.content) {
      // external content change (e.g., reopen)
      view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: tab.content } });
    }
  });

  onDestroy(() => view?.destroy());
</script>

<div class="editor" bind:this={el}></div>

<style>
  .editor { flex: 1; overflow: hidden; display: flex; }
  .editor :global(.cm-editor) { flex: 1; }
</style>
