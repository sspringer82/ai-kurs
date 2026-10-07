import { StringOutputParser } from '@langchain/core/output_parsers';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { RunnableLambda } from '@langchain/core/runnables';
import { initChatModel } from 'langchain';

// 1. Prompt-Template mit Platzhaltern
const prompt = ChatPromptTemplate.fromMessages([
  [
    'system',
    'Du übersetzt von {input_language} nach {output_language}. Gib nur die Übersetzung aus.',
  ],
  ['user', '{text}'],
]);

// 2. Modell
const model = await initChatModel('ollama:llama3.2', { temperature: 0 });

// 3. Output Parser: AIMessage -> string
const parser = new StringOutputParser();

// 4. Eigenes Runnable: beliebige Funktion als Kettenglied
const addMetaInfo = RunnableLambda.from((text) => ({
  text,
  length: text.length,
  words: text.split(/\s+/).length,
}));

// Jedes Element ist ein Runnable: Ausgabe des einen = Eingabe des nächsten
const chain = prompt.pipe(model).pipe(parser).pipe(addMetaInfo);

const result = await chain.invoke({
  input_language: 'Deutsch',
  output_language: 'Englisch',
  text: 'Lokale Sprachmodelle schützen vertrauliche Daten.',
});

console.log(result);

// Runnables können auch parallel mehrere Eingaben verarbeiten
const batch = await chain.batch([
  { input_language: 'Deutsch', output_language: 'Französisch', text: 'Guten Morgen!' },
  { input_language: 'Deutsch', output_language: 'Spanisch', text: 'Guten Morgen!' },
]);
console.log(batch.map((entry) => entry.text));
