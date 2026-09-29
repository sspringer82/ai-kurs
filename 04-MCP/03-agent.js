import { MultiServerMCPClient } from '@langchain/mcp-adapters';
import { createAgent } from 'langchain';

// Host-Applikation: LangChain-Agent + MCP-Client
// Weitere Server kommen einfach als zusätzlicher Eintrag hinzu – wie ein Plugin-System
const mcp = new MultiServerMCPClient({
  mcpServers: {
    notes: {
      transport: 'stdio',
      command: process.execPath,
      args: ['server/stdio.js'],
    },
    // Alternativ über HTTP (vorher npm run server:http):
    // notes: { transport: 'http', url: 'http://localhost:3000/mcp' },
  },
});

// Die MCP-Tools werden zu ganz normalen LangChain-Tools
const tools = await mcp.getTools();
console.log('Tools vom MCP-Server:', tools.map((tool) => tool.name));

const agent = createAgent({
  model: 'ollama:llama3.2',
  tools,
  systemPrompt: `Du verwaltest die Notizen des Benutzers mit den verfügbaren Tools.
Nutze ausschließlich die Ergebnisse der Tools und antworte auf Deutsch.`,
});

const result = await agent.invoke({
  messages: [{ role: 'user', content: 'Was steht auf meinen Einkaufslisten?' }],
});

for (const message of result.messages) {
  if (message.tool_calls?.length) {
    console.log('Tool Call:', message.tool_calls.map((c) => `${c.name}(${JSON.stringify(c.args)})`).join(', '));
  }
}
console.log(result.messages.at(-1).content);

await mcp.close();
