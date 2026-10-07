// Vorher den Server starten: npm run server:http
import { Client, StreamableHTTPClientTransport } from '@modelcontextprotocol/client';

const client = new Client({ name: 'notes-client-http', version: '1.0.0' });
await client.connect(new StreamableHTTPClientTransport(new URL('http://localhost:3000/mcp')));

const { tools } = await client.listTools();
console.log('Tools:', tools.map((t) => t.name));

// Ein Tool mit Seiteneffekt: legt eine neue Notiz auf dem Server an
const created = await client.callTool({
  name: 'create_note',
  arguments: { title: 'Idee aus dem Workshop', content: 'MCP-Server für unser Ticketsystem bauen.' },
});
console.log(created.content[0].text);

const found = await client.callTool({ name: 'search_notes', arguments: { term: 'Ticketsystem' } });
console.log(found.structuredContent);

await client.close();
