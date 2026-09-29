// Welche Modelle sind installiert – und wie stark sind sie quantisiert?
import ollama from 'ollama';

const { models } = await ollama.list();

const rows = models
  .filter((model) => !model.details.family.includes('bert')) // Embedding-Modelle ausblenden
  .map((model) => {
    const params = parseFloat(model.details.parameter_size); // z. B. "3.2B" -> 3.2
    const gb = model.size / 1e9;
    return {
      Modell: model.name,
      Parameter: model.details.parameter_size,
      Quantisierung: model.details.quantization_level,
      'Größe (GB)': gb.toFixed(1),
      // Speicherbedarf pro Milliarde Parameter: FP16 ≈ 2 GB, Q8 ≈ 1 GB, Q4 ≈ 0,6 GB
      'GB pro 1B Parameter': (gb / params).toFixed(2),
    };
  })
  .sort((a, b) => parseFloat(a['Größe (GB)']) - parseFloat(b['Größe (GB)']));

console.table(rows);

// Details eines Modells: Architektur, Kontextlänge, Quantisierung, Parameter
const info = await ollama.show({ model: 'llama3.2' });
const arch = info.model_info['general.architecture'];
console.log('\nllama3.2 im Detail:');
console.log({
  quantization: info.details.quantization_level,
  format: info.details.format,
  parameters: info.model_info['general.parameter_count'],
  contextLength: info.model_info[`${arch}.context_length`],
  embeddingLength: info.model_info[`${arch}.embedding_length`],
});
