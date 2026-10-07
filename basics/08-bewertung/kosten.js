// Was kostet eine KI-Funktion im Monat? Cloud-API vs. eigene Hardware
//
// Alle Preise sind BEISPIELWERTE zur Illustration – vor einer Entscheidung die aktuellen
// Preise der Anbieter und reale Hardware-Angebote eintragen.

// Nutzung: z. B. Ticket-Klassifikation (Tokens pro Anfrage aus evaluate.js übernehmen)
const usage = {
  requestsPerMonth: 300_000,
  inputTokens: 350, // System Prompt + Beispiele + Ticket
  outputTokens: 5,
};

// Preise in € pro 1 Mio. Tokens (Beispielwerte für drei Preisklassen)
const apiModels = {
  'API klein': { input: 0.1, output: 0.4 },
  'API mittel': { input: 1.0, output: 4.0 },
  'API Frontier': { input: 5.0, output: 25.0 },
};

// Eigener Server: Anschaffung über 36 Monate + Strom + Betrieb
const selfHosted = {
  'Eigener GPU-Server': { hardware: 6_000, months: 36, watts: 400, centsPerKwh: 30, operationsPerMonth: 300 },
};

const million = 1_000_000;
const rows = [];

for (const [name, price] of Object.entries(apiModels)) {
  const input = (usage.requestsPerMonth * usage.inputTokens * price.input) / million;
  const output = (usage.requestsPerMonth * usage.outputTokens * price.output) / million;
  rows.push({ Variante: name, 'Fix (€)': 0, 'Variabel (€)': Math.round(input + output), 'Summe / Monat (€)': Math.round(input + output) });
}

for (const [name, server] of Object.entries(selfHosted)) {
  const hardware = server.hardware / server.months;
  const power = ((server.watts / 1000) * 24 * 30 * server.centsPerKwh) / 100;
  const fixed = Math.round(hardware + power + server.operationsPerMonth);
  rows.push({ Variante: name, 'Fix (€)': fixed, 'Variabel (€)': 0, 'Summe / Monat (€)': fixed });
}

console.log(
  `${usage.requestsPerMonth.toLocaleString('de-DE')} Anfragen/Monat à ${usage.inputTokens} Eingabe- und ${usage.outputTokens} Ausgabe-Tokens\n`,
);
console.table(rows);

// Ausprobieren: Was ändert sich bei langen Antworten (outputTokens: 500)
// oder bei einem Reasoning-Modell (zusätzlich Tausende Denk-Tokens pro Anfrage)?
