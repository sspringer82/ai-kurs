// Was passiert, wenn der Prompt nicht ins Kontextfenster passt?
// Am Anfang steht eine Information, danach viel Text, am Ende die Frage danach.
import ollama from 'ollama';

const MODEL = 'llama3.2';

const secret = 'Der Zugangscode für den Serverraum lautet 4711.';
const filler = Array.from(
  { length: 250 },
  (_, i) => `Protokoll ${i + 1}: Die Wartung von Anlage ${i + 1} verlief ohne besondere Vorkommnisse.`,
).join('\n');
const prompt = `${secret}\n\n${filler}\n\nWie lautet der Zugangscode für den Serverraum? Antworte nur mit dem Code.`;

for (const numCtx of [2048, 8192]) {
  const response = await ollama.generate({
    model: MODEL,
    prompt,
    options: { num_ctx: numCtx, temperature: 0 },
  });

  console.log(`num_ctx ${String(numCtx).padStart(5)}: ${response.prompt_eval_count} Tokens verarbeitet → ${response.response.trim()}`);
}

// Ist der Prompt zu lang, schneidet Ollama ihn von vorne ab – ohne Fehlermeldung.
// Die Information am Anfang ist dann für das Modell schlicht nicht vorhanden.
