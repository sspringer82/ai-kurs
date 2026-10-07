// Beispieltext: eine Handlungsanweisung, bei der die Reihenfolge sicherheitsrelevant ist
export const procedure = `### Störung ERR-4238: Blockade der Zuführeinheit

Die Anlage stoppt und verriegelt den Antrieb, wenn die Zuführeinheit blockiert ist.

1. Anlage über den Hauptschalter spannungsfrei schalten.
2. Hauptschalter gegen Wiedereinschalten sichern.
3. Restdruck aus dem Pneumatikkreis ablassen.
4. Antriebseinheit über den Entriegelungshebel lösen.
5. Blockade entfernen und Zuführkanal auf Beschädigungen prüfen.
6. Anlage in umgekehrter Reihenfolge in Betrieb nehmen.`;

export function printChunks(chunks) {
  chunks.forEach((chunk, index) => {
    console.log(`--- Chunk ${index + 1} (${chunk.length} Zeichen) ---\n${chunk}\n`);
  });
}
