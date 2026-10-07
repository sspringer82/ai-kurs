// Multimodale Modelle verarbeiten neben Text auch Bilder
// Voraussetzung: ollama pull llama3.2-vision:11b
import { readFile } from 'node:fs/promises';
import ollama from 'ollama';

const MODEL = 'llama3.2-vision:11b';

// Aufruf: node 06-vision.js [Bild] [Frage]
const image = process.argv[2] ?? 'images/input.jpg';
const prompt = process.argv[3] ?? 'Beschreibe den Inhalt des Bildes in drei Sätzen.';

const response = await ollama.chat({
  model: MODEL,
  messages: [
    {
      role: 'user',
      content: prompt,
      // Bilder als Bytes (oder Base64) – Ollama kodiert sie für das Modell
      images: [await readFile(image)],
    },
  ],
  stream: true,
});

for await (const chunk of response) {
  process.stdout.write(chunk.message.content);
}
console.log();

// Zum Ausprobieren:
// node 06-vision.js images/input2.jpg "Wie lautet der handschriftliche Text auf dem Bild?"
