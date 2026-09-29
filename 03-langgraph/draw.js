// Hilfsfunktion: Graph als Mermaid-Diagramm ausgeben
// Die Ausgabe können Sie z. B. unter https://mermaid.live visualisieren
export async function printGraph(graph) {
  const drawable = await graph.getGraphAsync();
  console.log(drawable.drawMermaid());
}
