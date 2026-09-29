import path from 'node:path';

// Zentrale Konfiguration – Indexierung und Retrieval MÜSSEN dieselben Werte nutzen
export const QDRANT_URL = 'http://localhost:6333';
export const COLLECTION = 'mx-docs';

// Multilinguales Embedding-Modell: 1024 Dimensionen, 8192 Tokens Kontext
// ollama pull bge-m3
export const EMBEDDING_MODEL = 'bge-m3';
// Kleine Modelle lassen bei Prozeduren gerne Schritte weg –
// deutlich vollständiger antwortet z. B. 'gemma4:e4b'
export const CHAT_MODEL = 'llama3.2';

// Startwerte für das Chunking – Ausgangspunkt für eigene Messungen
export const CHUNK_SIZE = 1000;
export const CHUNK_OVERLAP = 100;

export const DOCS_DIR = path.resolve(import.meta.dirname, '..', 'docs');
