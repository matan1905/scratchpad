import type { Extension } from '@codemirror/state';
import { javascript } from '@codemirror/lang-javascript';
import { json } from '@codemirror/lang-json';
import { markdown } from '@codemirror/lang-markdown';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { xml } from '@codemirror/lang-xml';
import { python } from '@codemirror/lang-python';
import { rust } from '@codemirror/lang-rust';
import { sql } from '@codemirror/lang-sql';
import { yaml } from '@codemirror/lang-yaml';
import { StreamLanguage } from '@codemirror/language';
import { shell } from '@codemirror/legacy-modes/mode/shell';
import { toml } from '@codemirror/legacy-modes/mode/toml';
import { dockerFile } from '@codemirror/legacy-modes/mode/dockerfile';
import { lua } from '@codemirror/legacy-modes/mode/lua';
import { ruby } from '@codemirror/legacy-modes/mode/ruby';
import { go } from '@codemirror/legacy-modes/mode/go';
import { c, cpp, csharp, java, kotlin, dart, scala } from '@codemirror/legacy-modes/mode/clike';
import { perl } from '@codemirror/legacy-modes/mode/perl';
import { r } from '@codemirror/legacy-modes/mode/r';
import { properties } from '@codemirror/legacy-modes/mode/properties';

const MAP: Record<string, () => Extension> = {
  js: () => javascript(),
  mjs: () => javascript(),
  cjs: () => javascript(),
  jsx: () => javascript({ jsx: true }),
  ts: () => javascript({ typescript: true }),
  tsx: () => javascript({ typescript: true, jsx: true }),
  json: () => json(),
  jsonc: () => json(),
  json5: () => json(),
  md: () => markdown(),
  markdown: () => markdown(),
  html: () => html(),
  htm: () => html(),
  svg: () => xml(),
  xml: () => xml(),
  css: () => css(),
  scss: () => css(),
  sass: () => css(),
  less: () => css(),
  py: () => python(),
  rs: () => rust(),
  sql: () => sql(),
  graphql: () => sql(),
  gql: () => sql(),
  yaml: () => yaml(),
  yml: () => yaml(),
  sh: () => StreamLanguage.define(shell),
  bash: () => StreamLanguage.define(shell),
  zsh: () => StreamLanguage.define(shell),
  fish: () => StreamLanguage.define(shell),
  toml: () => StreamLanguage.define(toml),
  ini: () => StreamLanguage.define(properties),
  env: () => StreamLanguage.define(properties),
  dockerfile: () => StreamLanguage.define(dockerFile),
  lua: () => StreamLanguage.define(lua),
  rb: () => StreamLanguage.define(ruby),
  go: () => StreamLanguage.define(go),
  c: () => StreamLanguage.define(c),
  h: () => StreamLanguage.define(c),
  cpp: () => StreamLanguage.define(cpp),
  hpp: () => StreamLanguage.define(cpp),
  cc: () => StreamLanguage.define(cpp),
  cs: () => StreamLanguage.define(csharp),
  java: () => StreamLanguage.define(java),
  kt: () => StreamLanguage.define(kotlin),
  dart: () => StreamLanguage.define(dart),
  scala: () => StreamLanguage.define(scala),
  pl: () => StreamLanguage.define(perl),
  r: () => StreamLanguage.define(r),
};

export function languageFromFilename(name: string): Extension | null {
  const lower = name.toLowerCase();
  if (lower === 'dockerfile' || lower.endsWith('.dockerfile')) return MAP.dockerfile!();
  const ext = lower.includes('.') ? lower.slice(lower.lastIndexOf('.') + 1) : '';
  const f = MAP[ext];
  return f ? f() : null;
}

const PROSE_EXTS = new Set(['md', 'markdown', 'txt', 'log', '']);

export function isProseFile(name: string): boolean {
  const lower = name.toLowerCase();
  const ext = lower.includes('.') ? lower.slice(lower.lastIndexOf('.') + 1) : '';
  return PROSE_EXTS.has(ext);
}
