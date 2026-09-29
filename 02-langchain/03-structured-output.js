import { createAgent, initChatModel } from 'langchain';
import { z } from 'zod';

// Validierungsschema für die Antwort
const answer = z.object({
  country: z.string().describe('Der Name des Landes'),
  capital: z.string().describe('Die Hauptstadt des Landes'),
  continent: z
    .enum(['Europa', 'Asien', 'Afrika', 'Nordamerika', 'Südamerika', 'Ozeanien'])
    .describe('Der Kontinent, auf dem das Land liegt'),
});

const agent = createAgent({
  // Für Modelloptionen wie die Temperatur übergeben Sie eine Modellinstanz
  model: await initChatModel('ollama:llama3.2', { temperature: 0 }),
  systemPrompt:
    'Du bist ein Geografie-Experte. Antworte immer mit dem Land, seiner Hauptstadt und dem Kontinent.',
  // LangChain beschreibt die Struktur als Tool und validiert die Antwort
  responseFormat: answer,
});

for (const question of [
  'Was ist die Hauptstadt von Italien?',
  'Welche Hauptstadt hat Japan?',
  'Und die Hauptstadt von Kanada?',
]) {
  const result = await agent.invoke({
    messages: [{ role: 'user', content: question }],
  });

  if (result.structuredResponse) {
    // Typisiertes, validiertes Objekt statt Freitext
    console.log(result.structuredResponse);
  } else {
    // Kleine Modelle halten sich nicht immer an das Schema – die Validierung fängt das ab
    const error = result.messages.find((message) => message.type === 'tool');
    console.log('Validierung fehlgeschlagen:', error?.content);
  }
}
