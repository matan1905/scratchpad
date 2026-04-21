<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { EditorState, Compartment } from '@codemirror/state';
  import { EditorView, keymap, drawSelection } from '@codemirror/view';
  import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
  import { bracketMatching, indentOnInput, syntaxHighlighting, HighlightStyle } from '@codemirror/language';
  import { tags as t } from '@lezer/highlight';
  import { languageFromFilename, isProseFile } from '../lib/language';
  import { bidiAutoLines } from '../lib/direction';
  import type { Tab } from '../stores/tabs';
  import { updateContent } from '../stores/tabs';
  import { cursor } from '../stores/cursor';

  let { tab }: { tab: Tab } = $props();

  let el: HTMLDivElement;
  let view: EditorView | null = null;
  const langCompartment = new Compartment();
  const dirCompartment = new Compartment();

  let lastTabId: string | null = null;

  const darkHighlight = HighlightStyle.define([
    { tag: t.keyword, color: '#c586c0' },
    { tag: [t.name, t.deleted, t.character, t.macroName], color: '#e4e4e4' },
    { tag: [t.propertyName], color: '#9cdcfe' },
    { tag: [t.function(t.variableName), t.labelName], color: '#dcdcaa' },
    { tag: [t.color, t.constant(t.name), t.standard(t.name)], color: '#4fc1ff' },
    { tag: [t.definition(t.name), t.separator], color: '#e4e4e4' },
    { tag: [t.className], color: '#4ec9b0' },
    { tag: [t.number, t.changed, t.annotation, t.modifier, t.self, t.namespace], color: '#b5cea8' },
    { tag: [t.typeName], color: '#4ec9b0' },
    { tag: [t.operator, t.operatorKeyword], color: '#c586c0' },
    { tag: [t.url, t.escape, t.regexp, t.link], color: '#d7ba7d' },
    { tag: [t.meta, t.comment], color: '#6a9955', fontStyle: 'italic' },
    { tag: t.tagName, color: '#569cd6' },
    { tag: t.strong, fontWeight: 'bold' },
    { tag: t.emphasis, fontStyle: 'italic' },
    { tag: t.link, textDecoration: 'underline' },
    { tag: t.heading, fontWeight: 'bold', color: '#6b9fff' },
    { tag: [t.atom, t.bool, t.special(t.variableName)], color: '#569cd6' },
    { tag: [t.processingInstruction, t.string, t.inserted], color: '#ce9178' },
    { tag: t.invalid, color: '#ff5f57' },
  ]);

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
        drawSelection(),
        history(),
        bracketMatching(),
        indentOnInput(),
        syntaxHighlighting(darkHighlight),
        EditorView.lineWrapping,
        keymap.of([...defaultKeymap, ...historyKeymap, indentWithTab]),
        langCompartment.of(buildLangExt(tab)),
        dirCompartment.of(buildDirExt(tab)),
        EditorView.updateListener.of((u) => {
          if (u.docChanged) {
            updateContent(tab.id, u.state.doc.toString());
          }
          if (u.docChanged || u.selectionSet) {
            const head = u.state.selection.main.head;
            const line = u.state.doc.lineAt(head);
            cursor.set({ line: line.number, col: head - line.from + 1 });
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
