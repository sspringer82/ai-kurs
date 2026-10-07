// Ein Chat auf der Kommandozeile – ohne Verlauf
// Jede Anfrage steht für sich: Das Modell erinnert sich an nichts
import { createInterface } from 'node:readline/promises';
import ollama from 'ollama';

const MODEL = 'llama3.2';

const rl = createInterface({ input: process.stdin, output: process.stdout });

while (true) {
  const content = await rl.question('Du: ');
  if (content === 'exit') break;

  const response = await ollama.chat({
    model: MODEL,
    messages: [{ role: 'user', content }],
  });
  console.log(`Modell: ${response.message.content}\n`);
}

rl.close();

// Zum Ausprobieren:
// Bei einem Würfel ergeben die gegenüberliegenden Seiten immer die Zahl 7. Welche Zahl liegt der 6 gegenüber?
// Und welche Zahl liegt der 2 gegenüber?
