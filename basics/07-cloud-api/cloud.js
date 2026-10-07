// Kommerzielle Anbieter: die OpenAI-API mit dem offiziellen SDK
// Voraussetzung: Umgebungsvariable OPENAI_API_KEY (der Schlüssel bleibt auf dem Server!)
//
// Dasselbe Skript gegen Ollama – viele Anbieter und Runtimes sprechen dieses Format:
//   OPENAI_BASE_URL=http://localhost:11434/v1 OPENAI_API_KEY=ollama OPENAI_MODEL=llama3.2 node cloud.js
import OpenAI from 'openai';

const MODEL = process.env.OPENAI_MODEL ?? 'gpt-5-mini';

// Liest OPENAI_API_KEY und optional OPENAI_BASE_URL aus der Umgebung
const client = new OpenAI();

const completion = await client.chat.completions.create({
  model: MODEL,
  // Gleiche Nachrichtenstruktur wie bei ollama.js: system, user, assistant
  messages: [
    { role: 'system', content: 'Du antwortest auf Deutsch, knapp und präzise.' },
    { role: 'user', content: 'Nenne drei Kriterien für die Auswahl eines Sprachmodells.' },
  ],
});

console.log(completion.choices[0].message.content);

// Abgerechnet wird pro Token – Eingabe und Ausgabe getrennt
console.log(completion.usage);
