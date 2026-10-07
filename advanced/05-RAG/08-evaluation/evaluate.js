import { retrieve } from '../lib/retrieve.js';
import { testset } from './testset.js';

// Retrieval ist deterministisch: Jede Änderung der Kennzahl stammt aus Ihrer Änderung.
// Gemessen wird der Abstand zwischen Konfigurationen, nicht ein einzelner Lauf.

const isRelevant = (hit, expected) =>
  hit.source === expected.source && hit.content.includes(expected.text);

// Baureihe aus der Frage als exakter Filter
const seriesFilter = (question) => {
  const series = /MX-(\d{4})/.exec(question)?.[1];
  return series ? { series: `MX-${series}` } : {};
};

const configurations = [
  { name: 'k=3, ohne Filter', k: 3, filter: () => undefined },
  { name: 'k=3, nur freigegeben', k: 3, filter: () => ({ status: 'freigegeben' }) },
  { name: 'k=3, freigegeben + Baureihe', k: 3, filter: (q) => ({ status: 'freigegeben', ...seriesFilter(q) }) },
  { name: 'k=1, freigegeben + Baureihe', k: 1, filter: (q) => ({ status: 'freigegeben', ...seriesFilter(q) }) },
];

const answerable = testset.filter((test) => test.expected);

for (const config of configurations) {
  let found = 0;
  let reciprocalRanks = 0;
  const misses = [];

  for (const test of answerable) {
    const hits = await retrieve(test.question, { k: config.k, filter: config.filter(test.question) });
    const rank = hits.findIndex((hit) => isRelevant(hit, test.expected)) + 1;

    if (rank > 0) {
      found += 1;
      // MRR: Platz 1 = 1, Platz 2 = 0,5, Platz 3 = 0,33 …
      reciprocalRanks += 1 / rank;
    } else {
      misses.push(test.question);
    }
  }

  console.log(`\n${config.name}`);
  console.log(`  Recall@${config.k}: ${(found / answerable.length).toFixed(2)}`);
  console.log(`  MRR:      ${(reciprocalRanks / answerable.length).toFixed(2)}`);
  misses.forEach((question) => console.log(`  ✗ ${question}`));
}

// Unbeantwortbare Fragen: Die Vektorsuche liefert trotzdem Treffer.
// Liegt der Score nicht klar unter dem echter Treffer, reicht ein Schwellwert allein nicht.
console.log('\nUnbeantwortbare Fragen – bester Score:');
for (const test of testset.filter((t) => !t.expected)) {
  const [best] = await retrieve(test.question, { k: 1, filter: seriesFilter(test.question) });
  console.log(`  ${best.score.toFixed(3)}  ${test.question}  ->  ${best.heading}`);
}
