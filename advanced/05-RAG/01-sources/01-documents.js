import { mkdir, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { DOCS_DIR } from '../lib/config.js';
import { loadDocument } from '../lib/load-document.js';

// Alle Dokumente einlesen und als Markdown + Metadaten ablegen
const OUT_DIR = path.resolve(import.meta.dirname, '..', 'out');
await mkdir(OUT_DIR, { recursive: true });

for (const file of await readdir(DOCS_DIR)) {
  const { markdown, metadata } = await loadDocument(path.join(DOCS_DIR, file));
  await writeFile(path.join(OUT_DIR, `${path.parse(file).name}.md`), markdown, 'utf8');
  console.log(metadata);
}

// Ergebnis der PDF-Extraktion ansehen: Aus "5.3 Getriebe wechseln" wird eine Überschrift
const { markdown } = await loadDocument(path.join(DOCS_DIR, 'MX-4200.pdf'));
console.log(`\n--- MX-4200.pdf als Markdown ---\n${markdown}`);
