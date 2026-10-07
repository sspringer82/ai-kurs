import { OllamaEmbeddings } from '@langchain/ollama';
import { QdrantVectorStore } from '@langchain/qdrant';
import { COLLECTION, EMBEDDING_MODEL, QDRANT_URL } from './config.js';

// Dasselbe Embedding-Modell für Indexierung UND Suche –
// Vektoren verschiedener Modelle liegen in verschiedenen Räumen
export const embeddings = new OllamaEmbeddings({ model: EMBEDDING_MODEL });

export const vectorStore = new QdrantVectorStore(embeddings, {
  url: QDRANT_URL,
  collectionName: COLLECTION,
});
