// Dieselben Aufgaben an mehrere Modelle: Wo machen Größe und Modellfamilie einen Unterschied?
//
// Aufruf: node vergleich.js [modell …]
//   node vergleich.js llama3.2:1b llama3.2 gemma4:e4b qwen3.5:9b
import ollama from 'ollama';

const models = process.argv.length > 2 ? process.argv.slice(2) : ['llama3.2:1b', 'llama3.2', 'gemma4:e4b'];

const tasks = {
  Logik: 'Ein Schläger und ein Ball kosten zusammen 1,10 €. Der Schläger kostet 1 € mehr als der Ball. Was kostet der Ball? Antworte nur mit dem Betrag.',
  Wissen: 'Was ist der Unterschied zwischen einem Promise und async/await in JavaScript? Antworte in zwei Sätzen.',
  Sprache: 'Formuliere höflich in einem Satz: "Ihre Rechnung ist seit drei Wochen überfällig."',
  Extraktion: 'Gib nur JSON mit name, ort und datum zurück: "Am 3. März besucht Frau Dr. Keller unseren Standort in Augsburg."',
};

for (const [task, prompt] of Object.entries(tasks)) {
  console.log(`\n=== ${task}: ${prompt}`);
  for (const model of models) {
    const response = await ollama.chat({
      model,
      messages: [{ role: 'user', content: prompt }],
      think: false, // Reasoning-Modelle hier ohne Gedankenkette – siehe thinking.js
      options: { temperature: 0 },
    });
    const seconds = (response.total_duration / 1e9).toFixed(1);
    console.log(`\n[${model}, ${seconds} s]\n${response.message.content.trim()}`);
  }
}

// Erwartete Antwort Logik: 0,05 € (die intuitive, falsche Antwort ist 0,10 €)
