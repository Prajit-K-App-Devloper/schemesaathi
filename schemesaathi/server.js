require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const KEY = process.env.GEMINI_API_KEY;
const MODEL = process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite';

app.set('trust proxy', 1); // behind Cloudflare + nginx
app.use(express.json({ limit: '100kb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Tiny in-memory rate limiter: 20 requests / minute / IP
const hits = new Map();
function limiter(req, res, next) {
  const ip = req.ip, now = Date.now();
  const list = (hits.get(ip) || []).filter(t => now - t < 60000);
  if (list.length >= 20) return res.status(429).json({ error: 'Too many requests. Please wait a minute.' });
  list.push(now); hits.set(ip, list); next();
}
setInterval(() => hits.clear(), 10 * 60000).unref();

app.get('/health', (req, res) => res.json({ ok: true, aiConfigured: Boolean(KEY), model: MODEL }));

app.post('/api/explain', limiter, async (req, res) => {
  const { text, language = 'English', profile = {} } = req.body || {};
  if (!text || text.trim().length < 20) return res.status(400).json({ error: 'Please paste at least a few lines of the notice or scheme.' });
  if (!KEY) return res.status(500).json({ error: 'Server is missing GEMINI_API_KEY.' });

  const prompt = `You are SchemeSaathi, a helper that explains Indian government notices, welfare schemes and local laws to ordinary citizens.
Write ALL output text in ${language}, in very simple words a Class 8 student would understand. Do not invent facts that are not in the document. If something is unclear or missing, say so.
Citizen profile (may be partly empty): ${JSON.stringify(profile)}

DOCUMENT:
"""${text.slice(0, 12000)}"""

Return ONLY JSON with this shape:
{
 "title": "short name of the scheme/notice",
 "summary": "3-4 simple sentences: what is this and who is it for",
 "keyPoints": ["benefit, amount, dates, rules ... (max 6)"],
 "eligibility": { "verdict": "likely_eligible" | "likely_not_eligible" | "need_more_info", "reasons": ["why, using the profile and document"] },
 "rights": ["rights or protections the citizen has under this document, if any"],
 "documentsNeeded": ["documents to keep ready"],
 "nextSteps": ["clear numbered-style actions, including deadline if given"],
 "warning": "one line: this is guidance, confirm at the official office/website"
}`;

  try {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': KEY },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json', temperature: 0.2 }
      })
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.error?.message || 'AI request failed');
    const raw = data.candidates?.[0]?.content?.parts?.map(p => p.text).join('') || '';
    res.json(JSON.parse(raw.replace(/```json|```/g, '').trim()));
  } catch (e) {
    console.error(e.message);
    res.status(502).json({ error: 'The AI could not process this right now. Please try again.' });
  }
});

app.listen(PORT, () => console.log(`SchemeSaathi running on http://localhost:${PORT}`));
