import { OllamaEmbeddings } from '@langchain/ollama';

// Das Prinzip eines Vector Stores in wenigen Zeilen:
// Text + Vektor + Metadaten speichern, bei der Suche alle Vektoren vergleichen
class MemoryVectorStore {
  entries = [];

  constructor(embeddings) {
    this.embeddings = embeddings;
  }

  async addDocuments(documents) {
    const vectors = await this.embeddings.embedDocuments(documents.map((d) => d.text));
    documents.forEach((document, i) => this.entries.push({ ...document, vector: vectors[i] }));
  }

  // Exakte Suche (k-NN): garantiert die besten Treffer, aber O(n) pro Anfrage.
  // Vektordatenbanken nutzen Indizes wie HNSW: Näherung, dafür sehr schnell.
  async search(query, k = 2, filter = () => true) {
    const queryVector = await this.embeddings.embedQuery(query);
    return this.entries
      .filter(filter)
      .map(({ vector, ...document }) => ({ ...document, score: cosine(queryVector, vector) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, k);
  }
}

const cosine = (a, b) => {
  const dot = a.reduce((sum, value, i) => sum + value * b[i], 0);
  return dot / (Math.hypot(...a) * Math.hypot(...b));
};

const store = new MemoryVectorStore(new OllamaEmbeddings({ model: 'bge-m3' }));

await store.addDocuments([
  { text: 'Hunde gelten als treue und verspielte Begleiter.', metadata: { topic: 'tiere' } },
  { text: 'Katzen sind unabhängig und erkunden gerne ihre Umgebung.', metadata: { topic: 'tiere' } },
  { text: 'Pferde sind seit Jahrhunderten Partner des Menschen.', metadata: { topic: 'tiere' } },
  { text: 'Der Zahnriemen der Zuführeinheit wird wöchentlich geprüft.', metadata: { topic: 'wartung' } },
]);

// Die Suche findet Bedeutung, nicht Wörter: "Pudel" kommt in keinem Text vor
console.log(await store.search('Pudel'));

// Die Vektorsuche liefert IMMER Ergebnisse – auch wenn nichts passt
console.log(await store.search('Wie hoch ist die Zugspitze?'));

// Metadatenfilter schränken die Kandidaten vor dem Vergleich ein
console.log(await store.search('Riemen', 1, (d) => d.metadata.topic === 'wartung'));
