import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { CHUNK_OVERLAP, CHUNK_SIZE } from './config.js';

const HEADING_LINE = /^(?<hashes>#{1,6})\s+(?<title>.+)$/;

// Strukturbewusstes Chunking in zwei Stufen:
// 1. An den Überschriften trennen – dort, wo der Autor einen Themenwechsel sieht
// 2. Zu große Abschnitte zusätzlich mit dem RecursiveCharacterTextSplitter zerlegen
export async function chunkMarkdown(
  markdown,
  { chunkSize = CHUNK_SIZE, chunkOverlap = CHUNK_OVERLAP } = {},
) {
  const splitter = RecursiveCharacterTextSplitter.fromLanguage('markdown', {
    chunkSize,
    chunkOverlap,
  });

  const chunks = [];
  for (const section of splitByHeadings(markdown)) {
    const parts =
      section.content.length <= chunkSize
        ? [section.content]
        : await splitter.splitText(section.content);

    for (const content of parts) {
      chunks.push({ headingPath: section.headingPath, content });
    }
  }
  return chunks;
}

// Abschnitte je Überschrift sammeln und den Überschriftenpfad mitführen,
// z. B. ["MX-4200 Servicehandbuch", "4 Störungsbehebung", "4.2 Störung ERR-4238 ..."]
function splitByHeadings(markdown) {
  const sections = [];
  const path = [];
  let buffer = [];

  const flush = () => {
    const content = buffer.join('\n').trim();
    // Abschnitte, die nur aus einer Überschrift bestehen, sind Rauschen im Index
    const hasBody = buffer.some((line) => line.trim() && !HEADING_LINE.test(line));
    if (hasBody) sections.push({ headingPath: [...path], content });
    buffer = [];
  };

  for (const line of markdown.split('\n')) {
    const match = HEADING_LINE.exec(line);
    if (match) {
      flush();
      const level = match.groups.hashes.length;
      path.length = level - 1;
      path[level - 1] = match.groups.title.trim();
    }
    buffer.push(line);
  }
  flush();

  return sections.map((section) => ({
    ...section,
    headingPath: section.headingPath.filter(Boolean),
  }));
}

// Der Überschriftenpfad wird Teil des Chunk-Texts und damit Teil des Vektors.
// So findet eine Frage nach der "MX-4200" auch Abschnitte, die die Baureihe nicht nennen.
export function toEmbeddingText(chunk) {
  return `${chunk.headingPath.join(' > ')}\n\n${chunk.content}`;
}
