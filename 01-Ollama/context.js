// Das Modell ist zustandslos: Der Kontext ist nur das, was wir bei jedem Aufruf mitschicken
import ollama from 'ollama';

const MODEL = 'llama3.2';

async function chat(messages) {
  const response = await ollama.chat({
    model: MODEL,
    messages,
    // Größe des Kontextfensters in Tokens – Ollama nutzt standardmäßig weniger,
    // als das Modell maximal kann. Mehr Kontext = mehr (V)RAM.
    options: { num_ctx: 8192, temperature: 0 },
  });
  return response;
}

// 1. Zwei unabhängige Aufrufe: Der zweite weiß nichts vom ersten
await chat([{ role: 'user', content: 'Meine Lieblingsfarbe ist Grün.' }]);
const forgotten = await chat([{ role: 'user', content: 'Was ist meine Lieblingsfarbe?' }]);
console.log('Ohne Verlauf:', forgotten.message.content);

// 2. Den Verlauf selbst mitschicken: Jetzt steht die Information im Kontext
const messages = [{ role: 'user', content: 'Meine Lieblingsfarbe ist Grün.' }];
const first = await chat(messages);
messages.push(first.message, { role: 'user', content: 'Was ist meine Lieblingsfarbe?' });

const remembered = await chat(messages);
console.log('Mit Verlauf: ', remembered.message.content);

// Der Kontext wächst mit jeder Nachricht – und damit Kosten und Laufzeit
console.log('\nTokens im Prompt:');
console.log(`  ohne Verlauf: ${forgotten.prompt_eval_count}`);
console.log(`  mit Verlauf:  ${remembered.prompt_eval_count}`);
