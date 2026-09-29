import { readFile } from 'node:fs/promises';
import { PDFParse } from 'pdf-parse';

// PDF auslesen, Text normalisieren und Überschriften als Markdown markieren
// Hinweis: PDF ist ein Layoutformat. Für komplexe Layouts (Spalten, Tabellen)
// eignen sich Layout-Analyse-Werkzeuge deutlich besser als reine Textextraktion.
export async function pdfToMd(filename) {
  const parser = new PDFParse({ data: await readFile(filename) });
  try {
    const { text } = await parser.getText();
    return markHeadings(normalizeText(text));
  } finally {
    await parser.destroy();
  }
}

// Zeilenenden, geschützte Leerzeichen, Seitenmarker und Leerzeilen vereinheitlichen
function normalizeText(text) {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/ /g, ' ')
    .replace(/^-- \d+ of \d+ --$/gm, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// Nummerierte Zeilen wie "5.3 Getriebe wechseln" werden zu Markdown-Überschriften
const HEADING = /^(?<number>\d+(?:\.\d+)+)\s+(?<title>\S.*)$/;

function markHeadings(text) {
  return text
    .split('\n')
    .map((line) => {
      const { number, title } = HEADING.exec(line.trim())?.groups ?? {};
      // Zu lange oder mit Satzzeichen endende Zeilen sind wohl Fließtext
      if (!number || title.length > 80 || /[.:;,]$/.test(title)) return line;
      const level = Math.min(number.split('.').length, 6);
      return `${'#'.repeat(level)} ${number} ${title}`;
    })
    .join('\n');
}
