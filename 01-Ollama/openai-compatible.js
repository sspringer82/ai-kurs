// Ollama bietet zusätzlich eine OpenAI-kompatible Schnittstelle unter /v1
// Bestehender Code für die OpenAI-API funktioniert so auch mit lokalen Modellen
const OLLAMA_URL = 'http://localhost:11434/v1';
const MODEL = 'llama3.2';

const response = await fetch(`${OLLAMA_URL}/chat/completions`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    // Ollama prüft den Schlüssel nicht, viele Clients erwarten aber einen
    Authorization: 'Bearer ollama',
  },
  body: JSON.stringify({
    model: MODEL,
    messages: [{ role: 'user', content: 'Nenne drei Open-Source-LLMs.' }],
  }),
});

const data = await response.json();

console.log(data.choices[0].message.content);
console.log(data.usage);
