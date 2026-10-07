// Wie ein Modell Text sieht: Zerlegung in Tokens
// o200k_base = Tokenizer der GPT-4o-Generation, cl100k_base = Tokenizer von GPT-4/GPT-3.5
// Andere Modellfamilien (Llama, Gemma, Qwen …) bringen jeweils ihren eigenen Tokenizer mit.
import { getEncoding } from 'js-tiktoken';

const o200k = getEncoding('o200k_base');
const cl100k = getEncoding('cl100k_base');

const texts = {
  Englisch: 'The weather in Munich is really nice today.',
  Deutsch: 'Das Wetter in München ist heute wirklich schön.',
  Kompositum: 'Donaudampfschifffahrtsgesellschaftskapitän',
  Code: 'const sum = (a, b) => a + b;',
  Zahl: '3.14159265358979',
  Emoji: 'Hallo 👋🦙',
};

// 1. Zerlegung sichtbar machen: Jedes Token zwischen senkrechten Strichen
console.log('Zerlegung mit o200k_base:\n');
for (const [name, text] of Object.entries(texts)) {
  const pieces = o200k.encode(text).map((id) => o200k.decode([id]));
  console.log(`${name.padEnd(11)} ${pieces.join('|')}`);
}

// 2. Gleicher Text, unterschiedlicher Tokenizer = unterschiedliche Anzahl Tokens
const rows = Object.entries(texts).map(([name, text]) => ({
  Text: name,
  Zeichen: text.length,
  'Tokens (cl100k)': cl100k.encode(text).length,
  'Tokens (o200k)': o200k.encode(text).length,
  'Zeichen pro Token': (text.length / o200k.encode(text).length).toFixed(1),
}));
console.log();
console.table(rows);

// 3. Token-IDs: Das Modell rechnet nur mit diesen Zahlen
console.log('\nToken-IDs für "Das Wetter in München":', o200k.encode('Das Wetter in München'));
