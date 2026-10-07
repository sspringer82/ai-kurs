// Chatbot-Backend: liefert das Frontend aus und spricht mit dem Modell
// Das Modell läuft serverseitig – der Browser sieht weder Modell noch API-Schlüssel
import express from 'express';
import ollama from 'ollama';

const MODEL = 'llama3.2';
const PORT = 8080;

const app = express();
app.use(express.static('public'));
app.use(express.json());

// Ein gemeinsamer Verlauf für alle – für die Demo genügt das.
// In einer echten Anwendung: ein Verlauf pro Benutzer bzw. Sitzung.
const messages = [{ role: 'system', content: 'Du bist ein freundlicher Assistent. Antworte auf Deutsch.' }];

// Variante 1: Antwort erst senden, wenn sie vollständig ist
app.post('/chat', async (request, response) => {
  messages.push({ role: 'user', content: request.body.content });

  const result = await ollama.chat({ model: MODEL, messages });
  messages.push(result.message);

  response.json(result.message);
});

// Variante 2: Tokens weiterreichen, sobald das Modell sie erzeugt
app.post('/chat-stream', async (request, response) => {
  messages.push({ role: 'user', content: request.body.content });

  response.setHeader('Content-Type', 'text/plain; charset=utf-8');
  response.setHeader('Cache-Control', 'no-cache');

  const stream = await ollama.chat({ model: MODEL, messages, stream: true });

  let answer = '';
  for await (const chunk of stream) {
    answer += chunk.message.content;
    response.write(chunk.message.content);
  }
  messages.push({ role: 'assistant', content: answer });
  response.end();
});

app.listen(PORT, () => {
  console.log(`Chat läuft auf http://localhost:${PORT}`);
});
