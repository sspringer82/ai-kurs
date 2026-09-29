import { OllamaEmbeddings } from '@langchain/ollama';

// Kosinus-Ähnlichkeit: 1 = gleiche Richtung, 0 = keine Ähnlichkeit
const dot = (a, b) => a.reduce((sum, value, i) => sum + value * b[i], 0);
const cosine = (a, b) => dot(a, b) / (Math.hypot(...a) * Math.hypot(...b));

const embeddings = new OllamaEmbeddings({ model: 'bge-m3' });

async function compare(query, candidates) {
  const [queryVector, ...vectors] = await embeddings.embedDocuments([query, ...candidates]);
  console.log(`\n"${query}"`);
  candidates
    .map((text, i) => ({ text, score: cosine(queryVector, vectors[i]) }))
    .sort((a, b) => b.score - a.score)
    .forEach(({ text, score }) => console.log(`  ${score.toFixed(3)}  ${text}`));
}

// 1. Semantische Nähe statt Stichwortgleichheit – auch über Sprachgrenzen hinweg
await compare('Katze', ['Kater', 'Hund', 'cat', 'Auto', 'Katzenstreu']);

// 2. Frage und Antwort haben unterschiedliche Form, liegen aber nah beieinander
await compare('Wie behebe ich eine Blockade der Zuführeinheit?', [
  'Blockade entfernen und Zuführkanal auf Beschädigungen prüfen.',
  'Die Siegelbacken erreichen Temperaturen bis 220 °C.',
  'Alle 2.000 Betriebsstunden: Ölwechsel am Hauptgetriebe.',
]);

// 3. Bezeichner tragen kaum Semantik: Fehlercodes liegen alle dicht beieinander
await compare('ERR-4238', ['ERR-3238', 'ERR-4240', 'ERR-9100', 'Blockade der Zuführeinheit']);
