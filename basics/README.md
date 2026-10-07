# Beispiele

Alle Beispiele sind ES-Module für Node.js (≥ 22) und laufen – bis auf `07-cloud-api` – gegen lokale Modelle in Ollama.
Die Nummerierung folgt der Reihenfolge der Kapitel.

## Vorbereitung

```bash
# Modelle laden
ollama pull llama3.2               # Chat-Modell (3B, Q4_K_M)
ollama pull llama3.2:1b            # kleines Modell für Vergleiche
ollama pull gemma4:e4b             # neuere Modellgeneration für Vergleiche
ollama pull qwen3.5:9b             # Reasoning-Modell (thinking)
ollama pull llama3.2-vision:11b    # optional: Bilder verstehen (≈ 8 GB)

# Abhängigkeiten pro Ordner installieren
cd 05-ollama && npm install
```

Für den Quantisierungsvergleich (`cd 04-performance && npm run quant`):

```bash
ollama pull llama3.2:3b-instruct-q4_K_M
ollama pull llama3.2:3b-instruct-q8_0
ollama pull llama3.2:3b-instruct-fp16
```

## Überblick

| Ordner | Kapitel | Inhalt |
| --- | --- | --- |
| `01-tokens` | 02 | Tokenisierung sichtbar machen (`tokens.js`), Wahrscheinlichkeiten der nächsten Tokens mit `logprobs` (`logprobs.js`), stilles Abschneiden bei zu kleinem Kontextfenster (`kontextfenster.js`) |
| `02-modelle` | 03 | Gleiche Aufgaben an mehrere Modelle (`vergleich.js`, Modelle als Argumente), Reasoning mit sichtbarer Gedankenkette und Token-Vergleich (`thinking.js`) |
| `03-grenzen` | 04 | Halluzination, Buchstaben zählen, Rechnen, Wissensstand, Prompt Injection (`grenzen.js [modell]`) |
| `04-performance` | 05 | Ladezeit, Prompt-Verarbeitung und Tokens/s mehrerer Modelle, Speicherbedarf und GPU-Anteil über `ollama ps` |
| `05-ollama` | 06 | ollama.js: erste Anfrage mit Metadaten, Chat ohne und mit Verlauf, System Prompt, Sampling-Parameter, Vision |
| `06-chat-app` | 06 | Chatbot als Client-/Server-Anwendung: Express-Backend, Browser-Frontend, Antwort komplett oder per Streaming (`npm start`, dann <http://localhost:8080>) |
| `07-cloud-api` | 06 | OpenAI-API mit dem offiziellen SDK; benötigt `OPENAI_API_KEY`, Modell über `OPENAI_MODEL`, per `OPENAI_BASE_URL` auch gegen Ollama |
| `08-bewertung` | 07 | Ticket-Klassifikation mit Testdatensatz: Modelle und Prompt-Varianten vergleichen (`evaluate.js`, `--prompt`, `--fehler`, `openai:<modell>` für die Cloud), Übung (`npm run uebung`), Kostenrechnung API vs. eigener Server (`kosten.js`) |

Tool Calling, LangChain, LangGraph, MCP und RAG sind Thema von [Tag 2](../../Tag2/examples/README.md).
