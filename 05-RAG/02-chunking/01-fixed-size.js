import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { printChunks, procedure } from './procedure.js';

// Feste Zeichenanzahl, ohne Rücksicht auf Wörter, Sätze oder Schritte
const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 150,
  chunkOverlap: 20,
  // Leerer Separator = Schnitt an beliebiger Zeichenposition
  separators: [''],
});

printChunks(await splitter.splitText(procedure));

// Beobachtung: Wörter und Handlungsschritte werden zerschnitten.
// Ein Chunk, der mit "4. Antriebseinheit lösen" beginnt, ist gut auffindbar –
// ihm fehlen aber die Schritte 1–3, die ihn ungefährlich machen.
