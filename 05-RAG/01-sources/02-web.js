import * as cheerio from 'cheerio';

// Webseiten als Datenquelle: HTML laden, Inhaltsbereich auswählen, Struktur erhalten
async function loadWebPage(url, selector = 'body') {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP-Fehler ${response.status} beim Laden von ${url}`);
  }

  const $ = cheerio.load(await response.text());
  const content = $(selector);

  // Navigation, Skripte & Co. sind Rauschen und verunreinigen die Chunks
  content.find('script, style, nav, table, .mw-editsection, sup.reference').remove();

  // Überschriften und Absätze als Markdown – die Struktur hilft später beim Chunking
  return content
    .find('h2, h3, p, li')
    .map((_, element) => {
      const text = $(element).text().replace(/\s+/g, ' ').trim();
      if (!text) return null;
      if (element.tagName === 'h2') return `\n## ${text}`;
      if (element.tagName === 'h3') return `\n### ${text}`;
      if (element.tagName === 'li') return `- ${text}`;
      return text;
    })
    .get()
    .filter(Boolean)
    .join('\n');
}

const markdown = await loadWebPage(
  'https://de.wikipedia.org/wiki/Retrieval-Augmented_Generation',
  '.mw-parser-output',
);

console.log(markdown.slice(0, 2000));
console.log(`\n… ${markdown.length} Zeichen insgesamt`);
