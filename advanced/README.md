# Beispiele – Tag 2

Alle Beispiele sind ES-Module für Node.js (≥ 22) und laufen gegen lokale Modelle in Ollama.

## Vorbereitung

```bash
# Modelle laden
ollama pull llama3.2        # Chat-Modell (3B)
ollama pull bge-m3          # Embeddings, multilingual, 1024 Dimensionen
ollama pull nomic-embed-text  # Embeddings zum Vergleich (768 Dimensionen)

# Abhängigkeiten pro Ordner installieren
cd 02-langchain && npm install
```

Für die RAG-Beispiele wird zusätzlich Qdrant benötigt:

```bash
cd 05-RAG
docker compose up -d        # Dashboard: http://localhost:6333/dashboard
npm run index               # Dokumente aus docs/ indexieren
```

## Überblick

| Ordner | Inhalt |
| --- | --- |
| `01-Ollama` | HTTP-API, Streaming (NDJSON), ollama.js, Kontext & Zustandslosigkeit, OpenAI-kompatible Schnittstelle, Quantisierung der installierten Modelle (`model-info.js`), eigene Modellvariante per `Modelfile` |
| `02-langchain` | `initChatModel`, `createAgent`, System Prompt, strukturierte Ausgabe, Streaming, Memory, Kontext-Zusammenfassung, Chains/Runnables, Tools, Tool-Middleware |
| `03-langgraph` | State, Nodes, Edges, Pipeline, Schleife mit bedingten Kanten, Parallelisierung, Agenten-Schleife mit `ToolNode`, Human in the Loop mit `interrupt` |
| `04-MCP` | MCP-Server mit Tools, Resources und Prompts; Clients für STDIO und Streamable HTTP; Integration in einen LangChain-Agenten; `npm run inspector` startet den MCP Inspector |
| `05-RAG` | Einlesen (PDF, Markdown, Web), Chunking-Strategien, Embeddings & Ähnlichkeit, Vector Store, Indexierung in Qdrant, Retrieval mit Filtern, Generation mit Quellenangaben, Evaluierung (Recall@k, MRR) |

Das RAG-Beispiel nutzt das Szenario einer Verpackungsmaschine **MX-4200**: Betriebsanleitungen
mehrerer, sehr ähnlicher Baureihen (`docs/MX-*.pdf`), ein Servicehandbuch und ein nicht
freigegebener Entwurf eines Servicebulletins. Damit lassen sich Verwechslungsgefahr,
Metadatenfilter, Quellenangaben und unbeantwortbare Fragen live zeigen.
