import { OllamaEmbeddings } from '@langchain/ollama';

// Ein Embedding ist ein Vektor fester Länge – unabhängig von der Textlänge
// Voraussetzung: ollama pull bge-m3 && ollama pull nomic-embed-text
const text = 'Was muss ich tun, wenn die Maschine ERR-4238 meldet?';

for (const model of ['bge-m3', 'nomic-embed-text']) {
  const embeddings = new OllamaEmbeddings({ model });

  const started = performance.now();
  const vector = await embeddings.embedQuery(text);

  console.log(`${model}`);
  console.log(`  Dimensionen: ${vector.length}`);
  console.log(`  Erste Werte: ${vector.slice(0, 5).map((v) => v.toFixed(4)).join(', ')} …`);
  console.log(`  Dauer:       ${Math.round(performance.now() - started)} ms`);
}

// embedDocuments verarbeitet viele Texte in einem Aufruf (Indexierung)
const embeddings = new OllamaEmbeddings({ model: 'bge-m3' });
const vectors = await embeddings.embedDocuments(['Katze', 'Hund', 'Auto']);
console.log(`\n${vectors.length} Vektoren mit je ${vectors[0].length} Dimensionen`);
