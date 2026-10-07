// Streaming über die Ollama-HTTP-API
// Ollama sendet NDJSON: ein JSON-Objekt pro Zeile, jedes enthält ein Stück der Antwort
const OLLAMA_URL = 'http://localhost:11434';
const MODEL = 'llama3.2';

const response = await fetch(`${OLLAMA_URL}/api/chat`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    model: MODEL,
    messages: [
      { role: 'system', content: 'Du antwortest immer auf Deutsch.' },
      { role: 'user', content: 'Erkläre in drei Sätzen, was ein Token ist.' },
    ],
    // stream ist bei Ollama standardmäßig aktiv
  }),
});

const decoder = new TextDecoder('utf-8');
let buffer = '';

for await (const chunk of response.body) {
  buffer += decoder.decode(chunk, { stream: true });

  // Ein Netzwerkpaket kann mehrere oder nur halbe Zeilen enthalten
  const lines = buffer.split('\n');
  buffer = lines.pop();

  for (const line of lines.filter(Boolean)) {
    const data = JSON.parse(line);
    process.stdout.write(data.message.content);

    if (data.done) {
      console.log(`\n\n[${data.eval_count} Tokens generiert]`);
    }
  }
}
