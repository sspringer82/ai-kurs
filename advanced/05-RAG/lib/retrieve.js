import { vectorStore } from './vector-store.js';

// Frage vektorisieren und die ähnlichsten Chunks aus dem Index lesen
// filter: exakte Einschränkung auf Metadaten, z. B. { series: 'MX-4200' }
export async function retrieve(question, { k = 5, filter } = {}) {
  const qdrantFilter = filter
    ? {
        must: Object.entries(filter).map(([key, value]) => ({
          key: `metadata.${key}`,
          match: { value },
        })),
      }
    : undefined;

  const results = await vectorStore.similaritySearchWithScore(question, k, qdrantFilter);

  // Score = Kosinus-Ähnlichkeit: keine absolute Größe, sondern abhängig
  // von Modell, Sprache und Textlänge
  return results.map(([document, score]) => ({
    content: document.pageContent,
    source: document.metadata.source,
    heading: document.metadata.heading,
    metadata: document.metadata,
    score,
  }));
}
