import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { printChunks, procedure } from './procedure.js';

// Der RecursiveCharacterTextSplitter kombiniert die Strategien:
// erst Absätze ("\n\n"), dann Zeilen ("\n"), dann Wörter (" "), zuletzt Zeichen ("")
const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 200,
  chunkOverlap: 60,
});

printChunks(await splitter.splitText(procedure));

// Wortbasiert: nur an Leerzeichen trennen
const wordSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 200,
  chunkOverlap: 30,
  separators: [' '],
});
console.log('=== Nur an Wortgrenzen ===\n');
printChunks(await wordSplitter.splitText(procedure));
