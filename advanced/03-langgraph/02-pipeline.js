import { readFile } from 'node:fs/promises';
import { END, START, StateGraph, StateSchema } from '@langchain/langgraph';
import { initChatModel } from 'langchain';
import { z } from 'zod';
import { printGraph } from './draw.js';

// State einer kleinen Dokumenten-Pipeline
const State = new StateSchema({
  filename: z.string(),
  rawText: z.string().optional(),
  meta: z
    .object({
      title: z.string(),
      language: z.string(),
      length: z.number(),
    })
    .optional(),
  summary: z.string().optional(),
});

const model = await initChatModel('ollama:llama3.2', { temperature: 0 });

// Knoten 1: Datei einlesen (reiner Code, kein LLM)
async function readInput(state) {
  const rawText = await readFile(new URL(state.filename, import.meta.url), 'utf8');
  return { rawText };
}

// Knoten 2: Metadaten per LLM mit strukturierter Ausgabe erzeugen
const extractor = model.withStructuredOutput(
  z.object({
    title: z.string().describe('Titel des Dokuments'),
    language: z.string().describe('Sprache des Dokuments, z. B. Deutsch'),
  }),
);

async function createMeta(state) {
  const meta = await extractor.invoke(
    `Ermittle Titel und Sprache des folgenden Texts:\n\n${state.rawText}`,
  );
  return { meta: { ...meta, length: state.rawText.length } };
}

// Knoten 3: Zusammenfassung
async function summarize(state) {
  const response = await model.invoke(
    `Fasse den folgenden Text in zwei Sätzen auf Deutsch zusammen:\n\n${state.rawText}`,
  );
  return { summary: response.content };
}

const graph = new StateGraph(State)
  .addNode('read_input', readInput)
  .addNode('create_meta', createMeta)
  .addNode('summarize', summarize)
  .addEdge(START, 'read_input')
  .addEdge('read_input', 'create_meta')
  .addEdge('create_meta', 'summarize')
  .addEdge('summarize', END)
  .compile();

await printGraph(graph);

// stream mit streamMode "updates" zeigt, welcher Knoten was geändert hat
for await (const update of await graph.stream(
  { filename: 'input.txt' },
  { streamMode: 'updates' },
)) {
  const [node, change] = Object.entries(update)[0];
  console.log(`\n[${node}]`, Object.keys(change).join(', '));
  if (change.meta) console.log(change.meta);
  if (change.summary) console.log(change.summary);
}
