import { END, START, StateGraph, StateSchema } from '@langchain/langgraph';
import { z } from 'zod';
import { printGraph } from './draw.js';

// 1. State: der gemeinsame Zustand, auf den alle Knoten zugreifen
const State = new StateSchema({
  text: z.string(),
});

// 2. Node: eine Funktion, die den State liest und eine Änderung zurückgibt
function uppercase(state) {
  return { text: state.text.toUpperCase() };
}

// 3. Edges: verbinden die Knoten zu einem Ablauf
const graph = new StateGraph(State)
  .addNode('uppercase', uppercase)
  .addEdge(START, 'uppercase')
  .addEdge('uppercase', END)
  .compile();

await printGraph(graph);

const result = await graph.invoke({ text: 'hallo langgraph' });
console.log(result); // { text: 'HALLO LANGGRAPH' }
