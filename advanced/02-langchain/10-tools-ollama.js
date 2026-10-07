// Tool Calling ohne Framework: der komplette Ablauf von Hand
import ollama from 'ollama';

const MODEL = 'llama3.2';

// Die eigentliche Implementierung – das Modell ruft sie nie selbst auf!
function getWeatherForCity({ city }) {
  const weather = {
    Berlin: 'Sonnig, 10°C',
    München: 'Bewölkt, 14°C',
    Hamburg: 'Regen, 12°C',
  };
  return weather[city] ?? 'Unbekannt';
}

const availableTools = { get_weather_for_city: getWeatherForCity };

// Die Beschreibung, die das Modell zu sehen bekommt: Name, Zweck, Schema
const tools = [
  {
    type: 'function',
    function: {
      name: 'get_weather_for_city',
      description: 'Liefert das aktuelle Wetter für eine Stadt',
      parameters: {
        type: 'object',
        properties: {
          city: { type: 'string', description: 'Name der Stadt, z. B. Berlin' },
        },
        required: ['city'],
      },
    },
  },
];

const messages = [
  {
    role: 'system',
    content:
      'Du beantwortest Wetterfragen ausschließlich mit dem Ergebnis des Wetter-Tools. Liefert das Tool "Unbekannt", sag, dass du es nicht weißt.',
  },
  { role: 'user', content: 'Wie ist das Wetter gerade in München?' },
];

// 1. Anfrage: Das Modell entscheidet, ob es ein Tool braucht
const first = await ollama.chat({ model: MODEL, messages, tools });
messages.push(first.message);

const toolCalls = first.message.tool_calls ?? [];
console.log('Tool Calls:', JSON.stringify(toolCalls, null, 2));

// 2. Die Applikation führt die Tools aus und hängt die Ergebnisse an
for (const call of toolCalls) {
  const fn = availableTools[call.function.name];
  const result = fn ? fn(call.function.arguments) : 'Unbekanntes Tool';
  messages.push({ role: 'tool', tool_name: call.function.name, content: result });
}

// 3. Zweite Anfrage: Das Modell formuliert die Antwort mit dem Tool-Ergebnis
const final = await ollama.chat({ model: MODEL, messages });
console.log('\nAntwort:', final.message.content);
