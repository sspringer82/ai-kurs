import { createAgent } from 'langchain';

// Ein Agent ist der "Harness" um das Modell: System Prompt, Tools, Middleware, Speicher
const agent = createAgent({
  model: 'ollama:llama3.2',
  // Rolle, Regeln, Fokus und Prioritäten zentral festlegen
  systemPrompt: `
    Du bist ein Geografie-Experte.
    Antworte immer auf Deutsch, knapp und präzise - maximal zwei Sätze.
    Wenn du dir nicht sicher bist, sag das.
  `,
});

// Der Agent arbeitet mit einer Liste von Nachrichten
const result = await agent.invoke({
  messages: [{ role: 'user', content: 'Was ist die Hauptstadt von Frankreich?' }],
});

// Die Antwort ist die letzte Nachricht der Historie
console.log(result.messages.at(-1).content);

// Welche Nachrichten liegen jetzt im Zustand?
console.log(result.messages.map((message) => message.type));
