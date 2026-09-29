import { createAgent } from 'langchain';
import { MemorySaver } from '@langchain/langgraph';

// Ein LLM ist zustandslos – der Checkpointer speichert die Nachrichtenhistorie
const checkpointer = new MemorySaver();

const agent = createAgent({
  model: 'ollama:llama3.2',
  systemPrompt: 'Antworte knapp in einem Satz.',
  // Zum Vergleich auskommentieren: Die zweite Frage verliert ihren Bezug
  checkpointer,
});

// Die Thread-ID identifiziert die Konversation (z. B. pro Benutzer/Session)
const thread = { configurable: { thread_id: 'session-1' } };

const first = await agent.invoke(
  { messages: [{ role: 'user', content: 'Was ist die Hauptstadt von Frankreich?' }] },
  thread,
);
console.log(first.messages.at(-1).content);

// Folgefrage ohne expliziten Bezug
const second = await agent.invoke(
  { messages: [{ role: 'user', content: 'Und von Finnland?' }] },
  thread,
);
console.log(second.messages.at(-1).content);

// Der gespeicherte Zustand des Threads
const state = await agent.getState(thread);
console.log(`${state.values.messages.length} Nachrichten im Thread`);
