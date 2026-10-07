import { createAgent } from 'langchain';

const agent = createAgent({ model: 'ollama:llama3.2' });

// streamEvents statt invoke: die Antwort kommt Token für Token
const stream = await agent.streamEvents(
  {
    messages: [
      { role: 'user', content: 'Erkläre in fünf Sätzen, wie ein LLM Text erzeugt.' },
    ],
  },
  { version: 'v3' },
);

// Pro Nachricht ein Text-Stream mit den einzelnen Tokens
for await (const message of stream.messages) {
  for await (const token of message.text) {
    process.stdout.write(token);
  }
}
console.log();
