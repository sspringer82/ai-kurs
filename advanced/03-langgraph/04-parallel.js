import { setTimeout as wait } from 'node:timers/promises';
import {
  END,
  ReducedValue,
  START,
  StateGraph,
  StateSchema,
} from '@langchain/langgraph';
import { z } from 'zod';
import { printGraph } from './draw.js';

const State = new StateSchema({
  // Reducer: parallele Knoten hängen ihre Ergebnisse an, statt sich zu überschreiben
  results: new ReducedValue(z.array(z.string()).default([]), {
    inputSchema: z.array(z.string()),
    reducer: (current, update) => [...current, ...update],
  }),
});

// Drei unabhängige Arbeitsschritte mit unterschiedlicher Dauer
const worker = (name, ms) => async () => {
  await wait(ms);
  console.log(`${name} fertig nach ${ms} ms`);
  return { results: [`${name} (${ms} ms)`] };
};

function merge(state) {
  console.log('Zusammengeführt:', state.results);
  return {};
}

const graph = new StateGraph(State)
  .addNode('web_search', worker('Websuche', 300))
  .addNode('database', worker('Datenbank', 600))
  .addNode('documents', worker('Dokumente', 1000))
  .addNode('merge', merge)
  // Fan-out: alle drei Knoten starten gleichzeitig
  .addEdge(START, 'web_search')
  .addEdge(START, 'database')
  .addEdge(START, 'documents')
  // Fan-in: merge wartet, bis alle fertig sind
  .addEdge(['web_search', 'database', 'documents'], 'merge')
  .addEdge('merge', END)
  .compile();

await printGraph(graph);

const started = performance.now();
await graph.invoke({});
console.log(`Gesamtdauer: ${Math.round(performance.now() - started)} ms`);
