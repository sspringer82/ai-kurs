import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { pdfToMd } from './pdf-to-md.js';

// Jedes Format wird in dieselbe Zielform gebracht: Markdown + Metadaten
export async function loadDocument(file) {
  const extension = path.extname(file).toLowerCase();
  const source = path.basename(file);

  let markdown;
  if (extension === '.pdf') {
    // Die erste Zeile der Betriebsanleitungen ist der Dokumenttitel
    markdown = (await pdfToMd(file)).replace(/^(?!#)(.+)/, '# $1');
  } else if (extension === '.md' || extension === '.txt') {
    markdown = await readFile(file, 'utf8');
  } else {
    throw new Error(`Nicht unterstütztes Format: ${extension}`);
  }

  return { markdown, metadata: extractMetadata(source, markdown) };
}

// Metadaten mit festem Vokabular: Filter sind exakte Operationen!
// "MX-4200", "MX4200" und "MX 4200" würden sonst als verschiedene Werte gelten.
function extractMetadata(source, markdown) {
  const series = /MX[-\s]?(\d{4})/i.exec(`${source} ${markdown}`)?.[1];
  const lowerSource = source.toLowerCase();

  return {
    source,
    series: series ? `MX-${series}` : 'unbekannt',
    docType: lowerSource.includes('bulletin')
      ? 'servicebulletin'
      : lowerSource.includes('handbuch')
        ? 'servicehandbuch'
        : 'anleitung',
    status: /entwurf/i.test(`${source} ${markdown.slice(0, 300)}`) ? 'entwurf' : 'freigegeben',
  };
}
