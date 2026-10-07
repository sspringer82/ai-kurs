import { readdir } from 'node:fs/promises';
import path from 'node:path';
import { Document } from '@langchain/core/documents';
import { chunkMarkdown, toEmbeddingText } from '../lib/chunking.js';
import { COLLECTION, DOCS_DIR, EMBEDDING_MODEL } from '../lib/config.js';
import { loadDocument } from '../lib/load-document.js';
import { embeddings, vectorStore } from '../lib/vector-store.js';

// Indexierung: Einlesen -> Chunking -> Embedding -> Speichern
// Voraussetzung: docker compose up -d (Qdrant) und ollama pull bge-m3

// Collection neu aufbauen, damit keine veralteten Chunks mit neuen konkurrieren
await vectorStore.client.deleteCollection(COLLECTION).catch(() => {});

const started = performance.now();
let total = 0;

for (const file of await readdir(DOCS_DIR)) {
  // 1. Einlesen: jedes Format wird zu Markdown + Metadaten
  const { markdown, metadata } = await loadDocument(path.join(DOCS_DIR, file));

  // 2. Chunking: strukturbewusst an Überschriften, große Abschnitte weiter zerlegen
  const chunks = await chunkMarkdown(markdown);

  // 3. Embedding: Überschriftenpfad + Inhalt, in einem Batch pro Dokument
  const texts = chunks.map(toEmbeddingText);
  const vectors = await embeddings.embedDocuments(texts);

  // 4. Speichern: Text, Vektor und Metadaten landen gemeinsam in Qdrant
  const documents = chunks.map(
    (chunk, index) =>
      new Document({
        pageContent: texts[index],
        metadata: {
          ...metadata,
          heading: chunk.headingPath.join(' > '),
          chunkIndex: index,
          // Hilft bei einem späteren Modellwechsel (= vollständige Neuindexierung)
          embeddingModel: EMBEDDING_MODEL,
        },
      }),
  );
  await vectorStore.addVectors(vectors, documents);

  total += chunks.length;
  console.log(`${file.padEnd(38)} ${String(chunks.length).padStart(3)} Chunks  [${metadata.series}, ${metadata.docType}, ${metadata.status}]`);
}

console.log(`\n${total} Chunks in ${Math.round(performance.now() - started)} ms indexiert.`);
console.log('Dashboard: http://localhost:6333/dashboard');
