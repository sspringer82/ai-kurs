import { StdioServerTransport } from '@modelcontextprotocol/server/stdio';
import { createServer } from './notes-server.js';

// STDIO: Der Client startet diesen Prozess und spricht über stdin/stdout mit ihm
// Wichtig: Kein console.log – stdout gehört dem Protokoll. Logs über console.error.
const server = createServer();
await server.connect(new StdioServerTransport());
console.error('notes-server läuft über STDIO');
