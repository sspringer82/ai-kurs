// Direkte Kommunikation mit der Ollama-HTTP-API – ganz ohne Bibliothek
const OLLAMA_URL = 'http://localhost:11434';
const MODEL = 'llama3.2';

async function ask(prompt) {
  const response = await fetch(`${OLLAMA_URL}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: MODEL,
      prompt,
      // Ohne Streaming liefert Ollama genau ein JSON-Objekt zurück
      stream: false,
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama antwortet mit Status ${response.status}`);
  }

  return response.json();
}

const data = await ask('Was bedeutet die Farbe Blau? Antworte in einem Satz.');

// Die Antwort des Modells
console.log('Antwort:', data.response);

// Metainformationen: Dauer in Nanosekunden, Anzahl der Tokens
console.log({
  model: data.model,
  promptTokens: data.prompt_eval_count,
  outputTokens: data.eval_count,
  totalMs: Math.round(data.total_duration / 1e6),
  loadMs: Math.round(data.load_duration / 1e6),
});
