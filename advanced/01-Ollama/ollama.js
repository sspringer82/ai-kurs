// Kommunikation über die offizielle ollama-Bibliothek
import ollama from 'ollama';

const MODEL = 'llama3.2';

const response = await ollama.chat({
  model: MODEL,
  messages: [
    { role: 'system', content: 'Du antwortest immer auf Deutsch und knapp.' },
    { role: 'user', content: 'Was bedeutet die Farbe Blau?' },
  ],
  stream: true,
});

// Die Bibliothek kümmert sich um das Parsen der einzelnen Stream-Pakete
for await (const chunk of response) {
  process.stdout.write(chunk.message.content);
}
console.log();
