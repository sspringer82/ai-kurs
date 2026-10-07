// Die erste Anfrage an ein lokales Modell über die offizielle ollama-Bibliothek
import ollama from 'ollama';

const MODEL = 'llama3.2';

const response = await ollama.chat({
  model: MODEL,
  messages: [{ role: 'user', content: 'Was bedeutet LLM? Antworte in zwei Sätzen.' }],
});

// Die Antwort des Modells
console.log(response.message.content);

// Metainformationen: Tokens und Dauer (Ollama misst in Nanosekunden)
console.log({
  promptTokens: response.prompt_eval_count,
  outputTokens: response.eval_count,
  totalMs: Math.round(response.total_duration / 1e6),
});
