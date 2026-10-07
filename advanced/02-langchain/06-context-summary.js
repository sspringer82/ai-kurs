import { createAgent, summarizationMiddleware } from 'langchain';
import { MemorySaver } from '@langchain/langgraph';

// Eigener Prompt für die Zusammenfassung: Welche Informationen müssen erhalten bleiben?
const summaryPrompt = `Fasse den folgenden Gesprächsverlauf knapp zusammen.
Behalte alle Fakten über den Benutzer (z. B. Name, Wohnort, Interessen) wörtlich bei.
Beantworte keine Fragen, fasse nur zusammen.

GESPRÄCHSVERLAUF:
{messages}

ZUSAMMENFASSUNG:`;

// Der Kontext ist endlich: Middleware fasst ältere Nachrichten zusammen
const agent = createAgent({
  model: 'ollama:llama3.2',
  systemPrompt: 'Du bist ein hilfreicher Assistent. Antworte in einem Satz.',
  checkpointer: new MemorySaver(),
  middleware: [
    summarizationMiddleware({
      model: 'ollama:llama3.2',
      summaryPrompt,
      // Ab dieser Tokenzahl wird zusammengefasst (hier bewusst sehr klein)
      trigger: { tokens: 150 },
      // Die letzten Nachrichten bleiben im Original erhalten
      keep: { messages: 2 },
    }),
  ],
});

const thread = { configurable: { thread_id: 'summary-demo' } };

const questions = [
  'Mein Name ist Basti und ich wohne in München.',
  'Ich interessiere mich für lokale LLMs.',
  'Welche Plattform eignet sich, um LLMs lokal auszuführen?',
  'Wie heiße ich und wo wohne ich?',
];

for (const question of questions) {
  const result = await agent.invoke(
    { messages: [{ role: 'user', content: question }] },
    thread,
  );
  console.log(`> ${question}\n${result.messages.at(-1).content}\n`);
}

// Die erste Nachricht ist jetzt die Zusammenfassung der älteren Historie
const state = await agent.getState(thread);
console.log('Nachrichten im Kontext:');
for (const message of state.values.messages) {
  console.log(`- [${message.type}] ${String(message.content).slice(0, 100)}`);
}
