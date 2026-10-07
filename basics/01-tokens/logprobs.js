// Welche Tokens hält das Modell für wahrscheinlich?
// Ollama liefert auf Wunsch zu jedem erzeugten Token die Wahrscheinlichkeiten der besten Alternativen.
import ollama from 'ollama';

const MODEL = 'llama3.2';

async function nextTokens(prompt, tokens = 6) {
  const response = await ollama.generate({
    model: MODEL,
    prompt,
    raw: true, // kein Chat-Template: das Modell setzt den Text einfach fort
    logprobs: true,
    top_logprobs: 5,
    options: { temperature: 0, num_predict: tokens },
  });

  console.log(`\n„${prompt}“ → „${response.response}“\n`);
  for (const step of response.logprobs) {
    // logprob = natürlicher Logarithmus der Wahrscheinlichkeit → Math.exp() ergibt 0 … 1
    const candidates = step.top_logprobs
      .map(({ token, logprob }) => `${JSON.stringify(token)} ${(Math.exp(logprob) * 100).toFixed(1)} %`)
      .join('  ');
    console.log(`${JSON.stringify(step.token).padEnd(14)} ${candidates}`);
  }
}

// Eindeutige Fortsetzung: Ein Token dominiert
await nextTokens('Die Hauptstadt von Bayern ist');

// Offene Fortsetzung: Die Wahrscheinlichkeit verteilt sich auf viele Kandidaten
await nextTokens('Mein Lieblingsessen ist');
