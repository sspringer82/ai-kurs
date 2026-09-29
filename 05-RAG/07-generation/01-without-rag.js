import { initChatModel } from 'langchain';
import { CHAT_MODEL } from '../lib/config.js';

// Ohne RAG: Das Modell kennt die Maschine nicht – und bemerkt das nicht
const model = await initChatModel(`ollama:${CHAT_MODEL}`);

const response = await model.invoke([
  { role: 'system', content: 'Du bist ein Assistent für Servicetechniker. Antworte auf Deutsch.' },
  {
    role: 'user',
    content: 'Unsere Verpackungsmaschine MX-4200 meldet ERR-4238. Was muss ich tun?',
  },
]);

// Eine plausibel klingende, frei erfundene Prozedur – ohne Quelle, ohne Warnsignal
console.log(response.content);
