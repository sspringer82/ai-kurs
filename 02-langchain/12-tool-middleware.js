import { createAgent, createMiddleware, ToolMessage } from 'langchain';
import { getWeatherForCity, mortgageCalculator } from './tools.js';

// Nur diese Tools dürfen tatsächlich ausgeführt werden
const ALLOWED_TOOLS = ['get_weather_for_city'];

// Middleware greift in jeden Tool Call ein: prüfen, protokollieren, blockieren
const toolGuard = createMiddleware({
  name: 'ToolGuard',
  wrapToolCall: async (request, handler) => {
    const { name, args, id } = request.toolCall;
    console.log(`[ToolGuard] ${name}(${JSON.stringify(args)})`);

    if (!ALLOWED_TOOLS.includes(name)) {
      console.log(`[ToolGuard] blockiert: ${name}`);
      return new ToolMessage({
        tool_call_id: id,
        content: `Fehler: Das Tool "${name}" darf nicht ausgeführt werden. Informiere den Benutzer.`,
      });
    }

    const started = performance.now();
    const result = await handler(request);
    console.log(`[ToolGuard] fertig nach ${Math.round(performance.now() - started)} ms`);
    return result;
  },
});

const agent = createAgent({
  model: 'ollama:llama3.2',
  tools: [mortgageCalculator, getWeatherForCity],
  middleware: [toolGuard],
  systemPrompt: 'Du nutzt die verfügbaren Tools und antwortest auf Deutsch.',
});

for (const question of [
  // 'Wie ist das Wetter in Hamburg?',
  'Berechne die Monatsrate für 100.000 Euro bei 3 Prozent über 20 Jahre.',
]) {
  const result = await agent.invoke({ messages: [{ role: 'user', content: question }] });
  console.log(`> ${question}\n${result.messages.at(-1).content}\n`);
}
