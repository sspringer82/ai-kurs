import { initChatModel } from 'langchain';

// Provider und Modell als Zeichenkette: "provider:modell"
// Ein Wechsel zu OpenAI, Anthropic & Co. ändert nur diese Zeile (+ Paket)
const model = await initChatModel('ollama:llama3.2');

// Kommunikation mit dem Modell
const response = await model.invoke('Was ist die Hauptstadt von Deutschland?');

// Der eigentliche Antworttext
console.log(response.content);

// Metainformationen zur Kommunikation
console.log('Tokens:', response.usage_metadata);
console.log('Dauer (ms):', {
  total: Math.round(response.response_metadata.total_duration / 1e6),
  load: Math.round(response.response_metadata.load_duration / 1e6),
});
