import { NodeStreamableHTTPServerTransport } from '@modelcontextprotocol/node';
import express from 'express';
import { createServer } from './notes-server.js';

const PORT = 3000;

const app = express();
app.use(express.json());

// Streamable HTTP, zustandslos: pro Request eine Server- und Transport-Instanz
app.post('/mcp', async (req, res) => {
  const server = createServer();
  const transport = new NodeStreamableHTTPServerTransport();

  res.on('close', () => {
    transport.close();
    server.close();
  });

  try {
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  } catch (error) {
    console.error(error);
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: '2.0',
        error: { code: -32603, message: 'Internal server error' },
        id: null,
      });
    }
  }
});

app.listen(PORT, () => {
  console.log(`MCP-Server läuft unter http://localhost:${PORT}/mcp`);
});
