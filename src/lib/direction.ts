import { ViewPlugin, Decoration, type DecorationSet, EditorView } from '@codemirror/view';
import { RangeSetBuilder } from '@codemirror/state';

const RTL_RE = /[\u0590-\u08FF\uFB1D-\uFDFF\uFE70-\uFEFF]/;
const LTR_RE = /[A-Za-z\u00C0-\u024F\u0370-\u052F]/;

function firstStrongDir(text: string): 'rtl' | 'ltr' | null {
  for (const ch of text) {
    if (RTL_RE.test(ch)) return 'rtl';
    if (LTR_RE.test(ch)) return 'ltr';
  }
  return null;
}

const rtlLine = Decoration.line({ attributes: { dir: 'rtl', style: 'text-align:right' } });
const ltrLine = Decoration.line({ attributes: { dir: 'ltr' } });

export const bidiAutoLines = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;
    constructor(view: EditorView) { this.decorations = this.build(view); }
    update(u: { docChanged: boolean; viewportChanged: boolean; view: EditorView }) {
      if (u.docChanged || u.viewportChanged) this.decorations = this.build(u.view);
    }
    build(view: EditorView): DecorationSet {
      const b = new RangeSetBuilder<Decoration>();
      for (const { from, to } of view.visibleRanges) {
        let pos = from;
        while (pos <= to) {
          const line = view.state.doc.lineAt(pos);
          const dir = firstStrongDir(line.text);
          if (dir === 'rtl') b.add(line.from, line.from, rtlLine);
          else if (dir === 'ltr') b.add(line.from, line.from, ltrLine);
          pos = line.to + 1;
          if (pos > view.state.doc.length) break;
        }
      }
      return b.finish();
    }
  },
  { decorations: (v) => v.decorations }
);
