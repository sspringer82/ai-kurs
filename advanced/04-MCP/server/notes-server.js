import { randomUUID } from 'node:crypto';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { McpServer, ResourceTemplate } from '@modelcontextprotocol/server';
import { z } from 'zod';

// Der Server kennt nur seine Fähigkeiten – nicht das Modell, nicht den Transport
const NOTES_DIR = path.resolve(import.meta.dirname, '..', 'notes');

// Hilfsfunktion: alle Notizen aus dem Dateisystem lesen
async function readNotes() {
  const files = (await readdir(NOTES_DIR)).filter((file) => file.endsWith('.md'));
  return Promise.all(
    files.map(async (file) => {
      const [heading, ...rest] = (await readFile(path.join(NOTES_DIR, file), 'utf8')).split('\n');
      return {
        id: path.basename(file, '.md'),
        title: heading.replace(/^#\s*/, ''),
        content: rest.join('\n').trim(),
      };
    }),
  );
}

const findNotes = async (term) =>
  (await readNotes()).filter((note) =>
    `${note.title} ${note.content}`.toLowerCase().includes(term.toLowerCase()),
  );

export function createServer() {
  const server = new McpServer({ name: 'notes-server', version: '1.0.0' });

  // ---------- Tools: aktive Fähigkeiten, dürfen Seiteneffekte haben ----------
  server.registerTool(
    'search_notes',
    {
      title: 'Notizen durchsuchen',
      description: 'Durchsucht Titel und Inhalt aller Notizen nach einem Begriff.',
      inputSchema: z.object({
        term: z.string().describe('Suchbegriff, z. B. "Einkauf"'),
      }),
      // Hinweise für den Client – nur vertrauen, wenn man dem Server vertraut
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async ({ term }) => {
      const notes = await findNotes(term);
      return {
        content: [{ type: 'text', text: JSON.stringify(notes) }],
        structuredContent: { notes },
      };
    },
  );

  server.registerTool(
    'create_note',
    {
      title: 'Notiz anlegen',
      description: 'Legt eine neue Notiz mit Titel und Inhalt an.',
      inputSchema: z.object({
        title: z.string().describe('Titel der Notiz'),
        content: z.string().describe('Inhalt der Notiz'),
      }),
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: false,
      },
    },
    async ({ title, content }) => {
      const id = randomUUID();
      await writeFile(path.join(NOTES_DIR, `${id}.md`), `# ${title}\n\n${content}\n`, 'utf8');
      return { content: [{ type: 'text', text: `Notiz "${title}" angelegt (id: ${id}).` }] };
    },
  );

  // ---------- Resources: rein lesend, über URIs adressiert ----------
  server.registerResource(
    'all_notes',
    'notes://all',
    {
      title: 'Alle Notizen',
      description: 'Alle auf dem Server gespeicherten Notizen.',
      mimeType: 'application/json',
    },
    async (uri) => ({
      contents: [
        { uri: uri.href, mimeType: 'application/json', text: JSON.stringify(await readNotes()) },
      ],
    }),
  );

  // Resource-Template mit Platzhalter in der URI
  server.registerResource(
    'notes_by_term',
    new ResourceTemplate('notes://search/{term}', { list: undefined }),
    {
      title: 'Notizen filtern',
      description: 'Alle Notizen, die den Suchbegriff enthalten.',
      mimeType: 'application/json',
    },
    async (uri, { term }) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: 'application/json',
          text: JSON.stringify(await findNotes(decodeURIComponent(String(term)))),
        },
      ],
    }),
  );

  // ---------- Prompts: vorgefertigte Vorlagen mit Argumenten ----------
  server.registerPrompt(
    'summarize_notes',
    {
      title: 'Notizen zusammenfassen',
      description: 'Fasst alle Notizen zu einem Thema strukturiert zusammen.',
      argsSchema: z.object({
        term: z.string().describe('Thema, zu dem zusammengefasst wird'),
      }),
    },
    async ({ term }) => ({
      messages: [
        {
          role: 'user',
          content: {
            type: 'resource',
            resource: {
              uri: `notes://search/${encodeURIComponent(term)}`,
              mimeType: 'application/json',
              text: JSON.stringify(await findNotes(term)),
            },
          },
        },
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Fasse die Notizen zum Thema »${term}« zusammen. Gliedere nach Themen und hebe offene Aufgaben hervor.`,
          },
        },
      ],
    }),
  );

  return server;
}
