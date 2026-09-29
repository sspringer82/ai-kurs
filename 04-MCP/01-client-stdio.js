import { Client } from '@modelcontextprotocol/client';
import { StdioClientTransport } from '@modelcontextprotocol/client/stdio';

// Der Client startet den Server als Kindprozess
const transport = new StdioClientTransport({
  command: process.execPath,
  args: ['server/stdio.js'],
});

const client = new Client({ name: 'notes-client', version: '1.0.0' });
await client.connect(transport);

// ---------- Discovery: Was kann der Server? ----------
const { tools } = await client.listTools();
console.log('Tools:', tools.map((t) => `${t.name} ${JSON.stringify(t.annotations ?? {})}`));

const { resources } = await client.listResources();
const { resourceTemplates } = await client.listResourceTemplates();
console.log('Resources:', resources.map((r) => r.uri));
console.log('Templates:', resourceTemplates.map((t) => t.uriTemplate));

const { prompts } = await client.listPrompts();
console.log('Prompts:', prompts.map((p) => p.name));

// ---------- Tool aufrufen ----------
const toolResult = await client.callTool({
  name: 'search_notes',
  arguments: { term: 'einkauf' },
});
console.log('\nTool search_notes:', toolResult.structuredContent);

// ---------- Resource lesen ----------
const resource = await client.readResource({ uri: 'notes://search/workshop' });
console.log('\nResource notes://search/workshop:', resource.contents[0].text);

// ---------- Prompt abrufen ----------
const prompt = await client.getPrompt({
  name: 'summarize_notes',
  arguments: { term: 'einkauf' },
});
console.log('\nPrompt summarize_notes:');
for (const message of prompt.messages) {
  console.log(`- [${message.role}/${message.content.type}]`, message.content.text ?? message.content.resource.uri);
}

await client.close();
