// Modelle und Prompts mit einem eigenen Testdatensatz vergleichen: Genauigkeit, Latenz, Tokens
//
// Aufruf: node evaluate.js [modell …] [--prompt name] [--fehler]
//   node evaluate.js llama3.2:1b llama3.2 gemma4:e4b
//   node evaluate.js llama3.2:1b --prompt uebung --fehler
//   node evaluate.js llama3.2 openai:gpt-5-mini        (Cloud-Modell, benötigt OPENAI_API_KEY)
import { parseArgs } from 'node:util';
import ollama from 'ollama';
import { CATEGORIES, testset } from './testset.js';
import { prompts } from './prompts.js';

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: { prompt: { type: 'string' }, fehler: { type: 'boolean' } },
});
const models = positionals.length ? positionals : ['llama3.2:1b', 'llama3.2'];
const promptNames = values.prompt ? [values.prompt] : ['zero-shot', 'few-shot'];
const showErrors = values.fehler;

// Einheitliche Schnittstelle für lokale und Cloud-Modelle: Antworttext + Tokens
async function complete(model, messages) {
  if (model.startsWith('openai:')) {
    const { default: OpenAI } = await import('openai');
    const completion = await new OpenAI().chat.completions.create({ model: model.slice(7), messages });
    return {
      text: completion.choices[0].message.content,
      inputTokens: completion.usage.prompt_tokens,
      outputTokens: completion.usage.completion_tokens,
    };
  }
  const response = await ollama.chat({
    model,
    messages,
    think: false,
    options: { temperature: 0, num_predict: 20 },
  });
  return { text: response.message.content, inputTokens: response.prompt_eval_count, outputTokens: response.eval_count };
}

// Modelle antworten nicht immer exakt im gewünschten Format – erste erlaubte Kategorie suchen
const normalize = (text) => CATEGORIES.find((category) => text.toUpperCase().includes(category)) ?? `? ${text.trim().slice(0, 30)}`;

const rows = [];
for (const model of models) {
  for (const name of promptNames) {
    const { system, examples } = prompts[name];
    const history = [{ role: 'system', content: system }];
    for (const [ticket, category] of examples) {
      history.push({ role: 'user', content: ticket }, { role: 'assistant', content: category });
    }

    let correct = 0;
    let ms = 0;
    let inputTokens = 0;
    let outputTokens = 0;
    const errors = [];

    for (const { text, expected } of testset) {
      const start = performance.now();
      const result = await complete(model, [...history, { role: 'user', content: text }]);
      ms += performance.now() - start;
      inputTokens += result.inputTokens;
      outputTokens += result.outputTokens;

      const actual = normalize(result.text);
      if (actual === expected) correct++;
      else errors.push({ Ticket: text.slice(0, 60), Erwartet: expected, Antwort: actual });
    }

    rows.push({
      Modell: model,
      Prompt: name,
      Genauigkeit: `${Math.round((correct / testset.length) * 100)} %`,
      'ms / Ticket': Math.round(ms / testset.length),
      'Eingabe-Tokens': Math.round(inputTokens / testset.length),
      'Ausgabe-Tokens': Math.round(outputTokens / testset.length),
    });

    if (showErrors && errors.length) {
      console.log(`\nFehler: ${model} / ${name}`);
      console.table(errors);
    }
  }
}

console.log();
console.table(rows);
