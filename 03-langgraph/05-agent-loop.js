import {
  END,
  MessagesValue,
  START,
  StateGraph,
  StateSchema,
} from '@langchain/langgraph';
import { ToolNode, toolsCondition } from '@langchain/langgraph/prebuilt';
import { initChatModel, tool } from 'langchain';
import { z } from 'zod';
import { printGraph } from './draw.js';

// Ein Tool mit Zugriff auf "interne" Daten
const getOrderStatus = tool(
  async ({ orderId }) => {
    const orders = {
      4711: 'versendet am 24.09., Zustellung voraussichtlich morgen',
      4712: 'in Bearbeitung, Versand in 2 Tagen',
    };
    return orders[orderId] ?? `Keine Bestellung mit der Nummer ${orderId} gefunden.`;
  },
  {
    name: 'get_order_status',
    description: 'Liefert den Status einer Bestellung anhand der Bestellnummer.',
    schema: z.object({ orderId: z.coerce.string().describe('Die Bestellnummer') }),
  },
);

const tools = [getOrderStatus];
const model = (await initChatModel('ollama:llama3.2', { temperature: 0 })).bindTools(tools);

// Der State besteht aus der Nachrichtenliste – MessagesValue hängt neue Nachrichten an
const State = new StateSchema({ messages: MessagesValue });

async function callModel(state) {
  const response = await model.invoke([
    {
      role: 'system',
      content:
        'Du bist ein Kundenservice-Assistent. Nutze das Tool für Bestellanfragen und antworte auf Deutsch.',
    },
    ...state.messages,
  ]);
  return { messages: [response] };
}

// Die klassische Agenten-Schleife als expliziter Graph
const graph = new StateGraph(State)
  .addNode('model', callModel)
  .addNode('tools', new ToolNode(tools))
  .addEdge(START, 'model')
  // Tool Call in der Antwort? -> "tools", sonst -> END
  .addConditionalEdges('model', toolsCondition, ['tools', END])
  .addEdge('tools', 'model')
  .compile();

await printGraph(graph);

const result = await graph.invoke({
  messages: [{ role: 'user', content: 'Wo bleibt meine Bestellung 4711?' }],
});

for (const message of result.messages) {
  const calls = message.tool_calls?.map((c) => `${c.name}(${JSON.stringify(c.args)})`);
  console.log(`[${message.type}]`, calls?.length ? calls.join(', ') : message.content);
}
