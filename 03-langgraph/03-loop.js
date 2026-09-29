import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { END, START, StateGraph, StateSchema } from '@langchain/langgraph';
import { initChatModel } from 'langchain';
import { z } from 'zod';
import { printGraph } from './draw.js';

// Pflichtfelder, die der Graph einsammeln muss
const FIELDS = ['name', 'address'];

const State = new StateSchema({
  input: z.string().optional(),
  data: z.record(z.string(), z.string()).default({}),
  missing: z.array(z.string()).default([]),
});

const rl = createInterface({ input, output });
const model = await initChatModel('ollama:llama3.2', { temperature: 0 });

// Beschreibungen und null statt optionaler Felder helfen kleinen Modellen
const extractor = model.withStructuredOutput(
  z.object({
    name: z.string().nullable().describe('Vollständiger Name der Person oder null'),
    address: z.string().nullable().describe('Vollständige Postanschrift oder null'),
  }),
);

// Knoten: Benutzer fragen – gezielt nach dem, was noch fehlt
async function promptNode(state) {
  const question = state.missing.length
    ? `Bitte noch angeben: ${state.missing.join(', ')}`
    : 'Bitte Name und vollständige Adresse eingeben:';
  return { input: await rl.question(`${question}\n> `) };
}

// Knoten: Daten per LLM extrahieren – nichts erfinden!
async function extractNode(state) {
  const extracted = await extractor.invoke(`
Extrahiere Name und Adresse nur, wenn sie ausdrücklich im Text genannt werden.
Erfinde keine Werte. Fehlende Felder lässt du weg.

Text: "${state.input}"`);

  const clean = Object.fromEntries(
    Object.entries(extracted).filter(([, value]) => value),
  );
  // Bereits erfasste Werte haben Vorrang vor neuen Extraktionen
  return { data: { ...clean, ...state.data } };
}

// Knoten: deterministische Prüfung im Code – nicht im Modell
function validateNode(state) {
  return { missing: FIELDS.filter((field) => !state.data[field]) };
}

const graph = new StateGraph(State)
  .addNode('prompt', promptNode)
  .addNode('extract', extractNode)
  .addNode('validate', validateNode)
  .addEdge(START, 'prompt')
  .addEdge('prompt', 'extract')
  .addEdge('extract', 'validate')
  // Bedingte Kante: Schleife zurück, solange Daten fehlen
  .addConditionalEdges(
    'validate',
    (state) => (state.missing.length === 0 ? 'done' : 'retry'),
    { done: END, retry: 'prompt' },
  )
  .compile();

await printGraph(graph);

const result = await graph.invoke({});
console.log('Vollständige Daten:', result.data);
rl.close();
