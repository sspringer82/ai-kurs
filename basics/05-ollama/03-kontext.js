// Ein Chat mit Verlauf: Wir schicken bei jeder Anfrage alle bisherigen Nachrichten mit
import { createInterface } from 'node:readline/promises';
import ollama from 'ollama';

const MODEL = 'llama3.2';

const rl = createInterface({ input: process.stdin, output: process.stdout });
const messages = [];

while (true) {
  const content = await rl.question('Du: ');
  if (content === 'exit') break;

  messages.push({ role: 'user', content });
  const response = await ollama.chat({ model: MODEL, messages });
  messages.push(response.message);

  console.log(`Modell: ${response.message.content}`);
  // Der Kontext wächst mit jeder Nachricht – und damit Kosten und Laufzeit
  console.log(`(${messages.length} Nachrichten, ${response.prompt_eval_count} Tokens im Prompt)\n`);
}

rl.close();

// Zum Ausprobieren:
// Bei einem Würfel ergeben die gegenüberliegenden Seiten immer die Zahl 7. Welche Zahl liegt der 6 gegenüber?
// Und welche Zahl liegt der 2 gegenüber?
