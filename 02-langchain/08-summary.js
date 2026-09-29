import { readFile } from 'node:fs/promises';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { RunnableLambda } from '@langchain/core/runnables';
import { initChatModel } from 'langchain';
import { PDFParse } from 'pdf-parse';

const FILE = new URL('./openwindow.pdf', import.meta.url);

// Eigenes Runnable: PDF-Datei auslesen
const loadPdf = RunnableLambda.from(async (file) => {
  const parser = new PDFParse({ data: await readFile(file) });
  try {
    const { text } = await parser.getText();
    return { text };
  } finally {
    await parser.destroy();
  }
});

const prompt = ChatPromptTemplate.fromMessages([
  [
    'system',
    'Du fasst Dokumente auf Deutsch zusammen: maximal fünf Stichpunkte, nur Fakten aus dem Text.',
  ],
  ['user', 'Dokument:\n"""\n{text}\n"""'],
]);

const model = await initChatModel('ollama:llama3.2', { temperature: 0.2 });

const chain = loadPdf.pipe(prompt).pipe(model).pipe(new StringOutputParser());

// Die Zusammenfassung wird gestreamt
for await (const chunk of await chain.stream(FILE)) {
  process.stdout.write(chunk);
}
console.log();
