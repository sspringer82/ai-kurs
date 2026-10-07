import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import {
  Command,
  END,
  interrupt,
  MemorySaver,
  START,
  StateGraph,
  StateSchema,
} from '@langchain/langgraph';
import { initChatModel } from 'langchain';
import { z } from 'zod';
import { printGraph } from './draw.js';

const State = new StateSchema({
  userInput: z.string(),
  product: z.string().optional(),
  quantity: z.number().optional(),
  confirmed: z.boolean().optional(),
  summary: z.string().optional(),
});

const model = await initChatModel('ollama:llama3.2', { temperature: 0 });
const extractor = model.withStructuredOutput(
  z.object({
    product: z.string().nullable().describe('Das bestellte Produkt'),
    quantity: z.number().nullable().describe('Die Menge, nur wenn genannt'),
  }),
);

// Knoten 1: Bestellung per LLM aus dem Freitext extrahieren
async function extract(state) {
  const { product, quantity } = await extractor.invoke(
    `Extrahiere Produkt und Menge. Erfinde nichts.\n\nText: "${state.userInput}"`,
  );
  return { product: product ?? undefined, quantity: quantity ?? undefined };
}

// Knoten 2: Fehlende Menge beim Menschen nachfragen – der Graph pausiert hier
function askQuantity(state) {
  if (state.quantity) return {};
  const quantity = interrupt({ question: `Wie viele "${state.product}" möchten Sie?` });
  return { quantity: Number(quantity) };
}

// Knoten 3: Bestätigung vor der eigentlichen Aktion einholen
function confirm(state) {
  const answer = interrupt({
    question: `Ich bestelle ${state.quantity} x ${state.product}. Bestätigen? (ja/nein)`,
  });
  return { confirmed: answer.trim().toLowerCase() === 'ja' };
}

// Knoten 4: Aktion ausführen – nur nach Freigabe
function placeOrder(state) {
  return {
    summary: state.confirmed
      ? `Bestellung aufgegeben: ${state.quantity} x ${state.product}`
      : 'Bestellung abgebrochen.',
  };
}

const graph = new StateGraph(State)
  .addNode('extract', extract)
  .addNode('ask_quantity', askQuantity)
  .addNode('confirm', confirm)
  .addNode('place_order', placeOrder)
  .addEdge(START, 'extract')
  .addEdge('extract', 'ask_quantity')
  .addEdge('ask_quantity', 'confirm')
  .addEdge('confirm', 'place_order')
  .addEdge('place_order', END)
  // Interrupts benötigen einen Checkpointer, um den Zustand zu sichern
  .compile({ checkpointer: new MemorySaver() });

// await printGraph(graph);

const rl = createInterface({ input, output });
const config = { configurable: { thread_id: 'order-1' } };

let state = await graph.invoke(
  { userInput: await rl.question('Was möchten Sie bestellen?\n> ') },
  config,
);

// Solange der Graph unterbrochen ist: Frage stellen und mit der Antwort fortsetzen
while (state.__interrupt__?.length) {
  const { question } = state.__interrupt__[0].value;
  const answer = await rl.question(`${question}\n> `);
  state = await graph.invoke(new Command({ resume: answer }), config);
}

console.log(state.summary);
rl.close();
