// Reasoning-Modelle: erst die Gedankenkette, dann die Antwort
// Voraussetzung: ein Modell mit der Fähigkeit "thinking" (ollama show <modell>), z. B. qwen3.5:9b
import ollama from 'ollama';

const MODEL = process.argv[2] ?? 'qwen3.5:9b';
const PROMPT =
  'Ein Schläger und ein Ball kosten zusammen 1,10 €. Der Schläger kostet 1 € mehr als der Ball. Was kostet der Ball?';

async function ask(think) {
  const stream = await ollama.chat({
    model: MODEL,
    messages: [{ role: 'user', content: PROMPT }],
    think,
    stream: true,
  });

  let inThinking = false;
  let last;
  for await (const chunk of stream) {
    // Die Gedankenkette kommt in einem eigenen Feld – getrennt von der eigentlichen Antwort
    if (chunk.message.thinking) {
      if (!inThinking) process.stdout.write('\x1b[2m[Denkt nach] ');
      inThinking = true;
      process.stdout.write(chunk.message.thinking);
    }
    if (chunk.message.content) {
      if (inThinking) process.stdout.write('\x1b[0m\n\n[Antwort] ');
      inThinking = false;
      process.stdout.write(chunk.message.content);
    }
    last = chunk;
  }
  return last;
}

console.log(`=== ${MODEL} ohne Thinking\n`);
const without = await ask(false);
console.log(`\n\n=== ${MODEL} mit Thinking\n`);
const withThinking = await ask(true);

// Gedanken sind Ausgabe-Tokens: Sie kosten Zeit (und bei APIs Geld)
console.log('\n');
console.table({
  'ohne Thinking': { 'Ausgabe-Tokens': without.eval_count, Sekunden: (without.total_duration / 1e9).toFixed(1) },
  'mit Thinking': { 'Ausgabe-Tokens': withThinking.eval_count, Sekunden: (withThinking.total_duration / 1e9).toFixed(1) },
});
