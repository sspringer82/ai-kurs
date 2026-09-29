import { createAgent } from 'langchain';
import { getWeatherForCity, mortgageCalculator } from './tools.js';

// Der Agent übernimmt die Tool-Schleife: Modell -> Tool -> Modell -> ...
const agent = createAgent({
  model: 'ollama:llama3.2',
  tools: [mortgageCalculator, getWeatherForCity],
  systemPrompt: `
    Du bist ein hilfreicher Assistent und nutzt die verfügbaren Tools.
    Verwende ausschließlich Informationen aus den Tool-Ergebnissen, erfinde nichts.
    Antworte auf Deutsch.
  `,
});

const questions = [
  'Wie hoch ist die Monatsrate für 250.000 Euro bei 4 Prozent Zinsen über 30 Jahre?',
  // 'Wie ist das Wetter gerade in der Hauptstadt von Frankreich?',
];

for (const question of questions) {
  const result = await agent.invoke({
    messages: [{ role: 'user', content: question }],
  });

  console.log(`\n> ${question}`);
  // Der Verlauf zeigt die Tool Calls und Tool-Nachrichten
  for (const message of result.messages) {
    if (message.tool_calls?.length) {
      console.log('  Tool Call:', message.tool_calls.map((c) => `${c.name}(${JSON.stringify(c.args)})`).join(', '));
    }
    if (message.type === 'tool') {
      console.log('  Tool Ergebnis:', message.content);
    }
  }
  console.log(result.messages.at(-1).content);
}
