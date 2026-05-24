const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const ROOT_DIR = __dirname;
const OPENAI_API_URL = 'https://api.openai.com/v1/responses';
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4.1-mini';
const SYSTEM_PROMPT =
  "You are Mobina, Goldline's AI assistant. You help visitors understand Goldline's services, approach, and whether their project is a good fit. Keep answers short, calm, professional, and useful. Avoid overexplaining. Ask one helpful follow-up question when appropriate. Goldline helps service businesses with positioning, website strategy, web design, development, digital presence, and connected execution.";

app.use(express.json({ limit: '1mb' }));
app.use(express.static(ROOT_DIR));

function normalizeHistory(history, message) {
  const safeHistory = Array.isArray(history)
    ? history
        .filter((entry) => entry && typeof entry === 'object')
        .map((entry) => ({
          role: entry.role === 'assistant' ? 'assistant' : 'user',
          content: typeof entry.content === 'string' ? entry.content.trim() : ''
        }))
        .filter((entry) => entry.content)
        .slice(-12)
    : [];

  const lastEntry = safeHistory[safeHistory.length - 1];

  if (!lastEntry || lastEntry.role !== 'user' || lastEntry.content !== message) {
    safeHistory.push({ role: 'user', content: message });
  }

  return safeHistory;
}

function extractReply(data) {
  if (typeof data?.output_text === 'string' && data.output_text.trim()) {
    return data.output_text.trim();
  }

  const outputs = Array.isArray(data?.output) ? data.output : [];

  for (const item of outputs) {
    if (item?.type !== 'message' || !Array.isArray(item.content)) continue;

    const text = item.content
      .filter((contentItem) => contentItem?.type === 'output_text' && typeof contentItem.text === 'string')
      .map((contentItem) => contentItem.text.trim())
      .filter(Boolean)
      .join('\n');

    if (text) {
      return text;
    }
  }

  throw new Error('OpenAI response did not include reply text.');
}

app.post('/api/chat', async (request, response) => {
  if (!process.env.OPENAI_API_KEY) {
    console.error('OPENAI_API_KEY is not set.');
    response.status(500).json({
      reply: 'Sorry, something went wrong. Try again in a moment.'
    });
    return;
  }

  const message = typeof request.body?.message === 'string' ? request.body.message.trim() : '';

  if (!message) {
    response.status(400).json({ error: 'Message is required.' });
    return;
  }

  const history = normalizeHistory(request.body?.history, message);

  try {
    const openAiResponse = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        instructions: SYSTEM_PROMPT,
        input: history.map((entry) => ({
          role: entry.role,
          content: entry.content
        }))
      })
    });

    const data = await openAiResponse.json();

    if (!openAiResponse.ok) {
      console.error('OpenAI API error:', data);
      response.status(500).json({
        reply: 'Sorry, something went wrong. Try again in a moment.'
      });
      return;
    }

    response.json({
      reply: extractReply(data)
    });
  } catch (error) {
    console.error('Chat request failed:', error);
    response.status(500).json({
      reply: 'Sorry, something went wrong. Try again in a moment.'
    });
  }
});

app.get('/', (_request, response) => {
  response.sendFile(path.join(ROOT_DIR, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Goldline site running at http://localhost:${PORT}`);
});
