// Testdatensatz: Frage + erwarteter Chunk (über Quelle und charakteristischen Text,
// nicht über die technische ID – die ändert sich bei jeder Neuindexierung)
export const testset = [
  {
    category: 'Faktenfrage',
    question: 'Welches Anzugsmoment gilt beim Wiedereinbau des Getriebes der MX-4200?',
    expected: { source: 'MX-4200.pdf', text: 'Anzugsmoment beim Wiedereinbau: 45 Nm' },
  },
  {
    category: 'Faktenfrage',
    question: 'Welche Teilenummer hat die Heizpatrone der MX-4200?',
    expected: { source: 'MX-4200-servicehandbuch.md', text: 'HP-4200-01' },
  },
  {
    category: 'Verwechslungsgefahr',
    question: 'Was muss ich tun, wenn die Maschine ERR-4238 meldet?',
    expected: { source: 'MX-4200.pdf', text: 'Störung ERR-4238' },
  },
  {
    category: 'Verwechslungsgefahr',
    question: 'Die MX-3000 meldet ERR-4231. Was ist zu tun?',
    expected: { source: 'MX-3000.pdf', text: 'Störung ERR-4231' },
  },
  {
    category: 'Verwechslungsgefahr',
    question: 'Wie behebe ich einen Sensorfehler im Zuführkanal der MX-4200?',
    expected: { source: 'MX-4200.pdf', text: 'Sensorfehler Zuführkanal' },
  },
  {
    category: 'Verteilte Antwort',
    question: 'Wie oft muss die Zuführeinheit der MX-4200 gewartet werden?',
    expected: { source: 'MX-4200.pdf', text: 'alle 500 Betriebsstunden' },
  },
  {
    category: 'Unbeantwortbar',
    question: 'Was bedeutet ERR-9100 an der MX-4200?',
    expected: null,
  },
];
