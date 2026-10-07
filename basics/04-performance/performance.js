// Was bestimmt die Geschwindigkeit eines lokalen Modells?
// Modellgröße, Quantisierung und Hardware im direkten Vergleich.
//
// Aufruf: node performance.js [modell …]
//   node performance.js llama3.2:1b llama3.2:3b mistral:7b
//   npm run quant   (dasselbe Modell in Q4, Q8 und FP16 – vorher per ollama pull laden)
import ollama from 'ollama';

const models = process.argv.length > 2 ? process.argv.slice(2) : ['llama3.2:1b', 'llama3.2:3b'];
const PROMPT = 'Erkläre in fünf Sätzen, was ein Large Language Model ist.';

const seconds = (ns) => ns / 1e9;

// Modell aus dem Speicher entfernen, damit jede Messung mit einem Kaltstart beginnt
// und das nächste Modell den kompletten Grafikspeicher bekommt.
// (Die Ladezeit enthält trotzdem den Festplatten-Cache des Betriebssystems.)
const unload = (model) => ollama.generate({ model, prompt: '', keep_alive: 0 });

// Alle laufenden Modelle entladen – sie würden sonst Grafikspeicher belegen
for (const running of (await ollama.ps()).models) {
  await unload(running.name);
}

// Digest je Modellname: Verschiedene Tags können auf dieselben Gewichte zeigen
// (z. B. llama3.2:3b und llama3.2:latest), ollama ps zeigt dann nur einen davon
const { models: installed } = await ollama.list();
const digestOf = (model) => installed.find((entry) => entry.name === model || entry.name === `${model}:latest`)?.digest;

const rows = [];
for (const model of models) {
  const response = await ollama.generate({
    model,
    prompt: PROMPT,
    options: { temperature: 0, num_predict: 200 },
  });

  // ollama ps: Wie groß ist das Modell im Speicher, wie viel davon liegt auf der GPU?
  const { models: running } = await ollama.ps();
  const loaded = running.find((entry) => entry.digest === digestOf(model));

  rows.push({
    Modell: model,
    Quantisierung: loaded?.details.quantization_level,
    'Speicher (GB)': loaded ? (loaded.size / 1e9).toFixed(1) : '?',
    'GPU-Anteil': loaded ? `${Math.round((loaded.size_vram / loaded.size) * 100)} %` : '?',
    'Laden (s)': seconds(response.load_duration).toFixed(1),
    'Prompt (Tokens/s)': Math.round(response.prompt_eval_count / seconds(response.prompt_eval_duration)),
    'Ausgabe (Tokens/s)': Math.round(response.eval_count / seconds(response.eval_duration)),
  });

  await unload(model);
}

console.table(rows);
