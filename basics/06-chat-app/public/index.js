const messages = document.getElementById('messages');
const form = document.getElementById('form');
const message = document.getElementById('message');
const streaming = document.getElementById('stream');

function addMessage(role, content = '') {
  const element = document.createElement('div');
  element.className = `message ${role}`;
  element.textContent = content;
  messages.appendChild(element);
  return element;
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const content = message.value;
  message.value = '';
  addMessage('user', content);
  const answer = addMessage('assistant', '…');

  const response = await fetch(streaming.checked ? '/chat-stream' : '/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  });

  if (!streaming.checked) {
    // Ohne Streaming: warten, bis die komplette Antwort da ist
    const data = await response.json();
    answer.textContent = data.content;
    return;
  }

  // Mit Streaming: jedes Paket sofort anzeigen
  answer.textContent = '';
  const decoder = new TextDecoder();
  for await (const chunk of response.body) {
    answer.textContent += decoder.decode(chunk, { stream: true });
  }
});
