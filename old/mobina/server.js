require('dotenv').config();

const express = require('express');
const path = require('path');
const OpenAI = require('openai');

const PORT = process.env.PORT || 3000;
const FALLBACK_REPLY = 'Sorry, something went wrong. Try again in a moment.';
const SYSTEM_PROMPT = "You are Mobina, Goldline's AI assistant. You help visitors understand Goldline's services, approach, and whether their project is a good fit. Keep answers short, calm, and useful - this is a chat widget, not an essay. Avoid overexplaining. Ask one helpful follow-up question when appropriate. Goldline helps service businesses with positioning, website strategy, web design, development, and digital presence.";

if (!process.env.OPENAI_API_KEY) {
     console.warn('Missing OPENAI_API_KEY. Set it in your environment before starting the server.');
     process.exit(1);
}

const app = express();
const openai = new OpenAI({
     apiKey: process.env.OPENAI_API_KEY
});

function normalizeHistory(history) {
     if (!Array.isArray(history)) {
          return [];
     }

     return history
          .filter(item => item && (item.role === 'user' || item.role === 'assistant'))
          .map(item => ({
               role: item.role,
               content: typeof item.content === 'string' ? item.content.trim() : ''
          }))
          .filter(item => item.content.length > 0)
          .slice(-12);
}

app.use(express.json({ limit: '1mb' }));

app.use((error, req, res, next) => {
     if (error instanceof SyntaxError && req.path === '/api/chat') {
          return res.status(400).json({ reply: FALLBACK_REPLY });
     }

     return next(error);
});

app.post('/api/chat', async (req, res) => {
     const message = typeof req.body?.message === 'string' ? req.body.message.trim() : '';

     if (!message) {
          return res.status(400).json({ reply: FALLBACK_REPLY });
     }

     const history = normalizeHistory(req.body?.history);

     try {
          const completion = await openai.chat.completions.create({
               model: 'gpt-4.1-mini',
               max_tokens: 1024,
               messages: [
                    { role: 'system', content: SYSTEM_PROMPT },
                    ...history,
                    { role: 'user', content: message }
               ]
          });

          const reply = completion.choices?.[0]?.message?.content?.trim();

          if (!reply) {
               return res.json({ reply: FALLBACK_REPLY });
          }

          return res.json({ reply });
     } catch (error) {
          console.error('Chat request failed.');
          return res.json({ reply: FALLBACK_REPLY });
     }
});

app.use(express.static(path.join(__dirname)));

app.listen(PORT, () => {
     console.log(`Goldline chatbot server listening on port ${PORT}`);
});
