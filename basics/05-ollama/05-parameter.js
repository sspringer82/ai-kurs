// Sampling-Parameter: Wie viel Zufall darf bei der Auswahl des nächsten Tokens im Spiel sein?
import ollama from 'ollama';

const MODEL = 'gemma4:e4b';
const PROMPT = 'Erfinde einen Namen für ein Café in München. Antworte nur mit dem Namen.';
const RUNS = 3;

async function sample(label, options) {
  const answers = [];
  for (let i = 0; i < RUNS; i++) {
    const response = await ollama.generate({ model: MODEL, prompt: PROMPT, options });
    answers.push(response.response.trim());
  }
  console.log(`${label.padEnd(28)} ${answers.join(' | ')}`);
}

// temperature 0: immer das wahrscheinlichste Token → (nahezu) deterministisch
await sample('temperature 0', { temperature: 0 });

// Standardwerte von Ollama: temperature 0.8, top_k 40, top_p 0.9
await sample('Standard', {});

// Hohe Temperatur: unwahrscheinlichere Tokens kommen öfter zum Zug
await sample('temperature 1.5', { temperature: 1.5 });

// Gleicher Seed = gleicher Zufall → reproduzierbar trotz hoher Temperatur
await sample('temperature 1.5 + seed 42', { temperature: 1.5, seed: 42 });

// top_k 1: nur noch das wahrscheinlichste Token steht zur Auswahl
await sample('top_k 1', { top_k: 1 });

// num_predict begrenzt die Anzahl der erzeugten Tokens
const short = await ollama.generate({
  model: MODEL,
  prompt: 'Erkläre ausführlich, wie ein Large Language Model funktioniert.',
  options: { num_predict: 20 },
});
console.log(`\nnum_predict 20 (done_reason: ${short.done_reason}):\n${short.response}`);
