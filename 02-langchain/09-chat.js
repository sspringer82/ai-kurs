import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { createAgent } from 'langchain';
import { MemorySaver } from '@langchain/langgraph';

// Kleine Chat-Applikation auf der Kommandozeile: Agent + Speicher + Streaming
const agent = createAgent({
  model: 'ollama:llama3.2',
  systemPrompt: 'Du bist ein freundlicher Assistent. Antworte auf Deutsch.',
  checkpointer: new MemorySaver(),
});

const thread = { configurable: { thread_id: 'cli-chat' } };
const rl = readline.createInterface({ input, output });

console.log("Chat bereit – 'exit' beendet die Unterhaltung.\n");

while (true) {
  const question = await rl.question('Du: ');
  if (question.trim().toLowerCase() === 'exit') break;

  process.stdout.write('KI: ');
  const stream = await agent.streamEvents(
    { messages: [{ role: 'user', content: question }] },
    { ...thread, version: 'v3' },
  );
  for await (const message of stream.messages) {
    for await (const token of message.text) {
      process.stdout.write(token);
    }
  }
  console.log('\n');
}

rl.close();
