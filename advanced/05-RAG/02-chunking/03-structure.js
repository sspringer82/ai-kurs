import path from 'node:path';
import { chunkMarkdown, toEmbeddingText } from '../lib/chunking.js';
import { DOCS_DIR } from '../lib/config.js';
import { loadDocument } from '../lib/load-document.js';

// Strukturbewusstes Chunking: Trennung an Überschriften, große Abschnitte zusätzlich zerlegen
const { markdown } = await loadDocument(path.join(DOCS_DIR, 'MX-4200-servicehandbuch.md'));

// Kleine Chunk-Größe, damit auch die zweite Stufe sichtbar wird
const chunks = await chunkMarkdown(markdown, { chunkSize: 500, chunkOverlap: 50 });

for (const chunk of chunks) {
  console.log(`${String(chunk.content.length).padStart(4)} Zeichen | ${chunk.headingPath.join(' > ')}`);
}

// Der Abschnitt nennt die Baureihe nicht – erst der Überschriftenpfad macht ihn
// für eine Frage nach der "MX-4200" auffindbar
const torque = chunks.find((chunk) => chunk.headingPath.at(-1).includes('Anzugsmomente'));
console.log(`\n--- Text für das Embedding ---\n${toEmbeddingText(torque)}`);
