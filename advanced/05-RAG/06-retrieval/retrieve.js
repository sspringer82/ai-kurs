import { retrieve } from '../lib/retrieve.js';

// Aufruf: node 06-retrieval/retrieve.js "Frage" [Baureihe]
// Beispiel: node 06-retrieval/retrieve.js "Was tun bei ERR-4238?" MX-4200
const question = process.argv[2] ?? 'Was muss ich tun, wenn die Maschine ERR-4238 meldet?';
const series = process.argv[3];

function print(title, hits) {
  console.log(`\n=== ${title} ===`);
  for (const hit of hits) {
    console.log(`${hit.score.toFixed(3)}  ${hit.source.padEnd(36)} ${hit.heading}`);
  }
}

console.log(`Frage: ${question}`);

// 1. Reine Ähnlichkeitssuche: liefert IMMER k Treffer – passend oder nicht
print('Top 5 ohne Filter', await retrieve(question, { k: 5 }));

// 2. Mit Metadatenfilter: nur freigegebene Dokumente (keine Entwürfe)
print('Top 5, nur freigegeben', await retrieve(question, { k: 5, filter: { status: 'freigegeben' } }));

// 3. Filter auf die Baureihe: exakte Kriterien gehören in den Filter, nicht in den Vektor
if (series) {
  print(
    `Top 5, nur ${series} + freigegeben`,
    await retrieve(question, { k: 5, filter: { series, status: 'freigegeben' } }),
  );
}
