export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  const { prompt } = req.body || {};

  if (!prompt || typeof prompt !== 'string' || prompt.length > 500) {
    return res.status(400).json({ error: 'Invalid prompt' });
  }

  const systemPrompt = `You are a game UI CSS expert. When given a description of a game UI component, you output ONLY a JSON object with two keys:
- "html": a self-contained HTML snippet demonstrating the component (inline styles allowed, no external deps, no <script> tags)
- "css": the corresponding CSS as a clean, well-commented string

The component should look stunning — use glows, gradients, pixel-art vibes, animations where appropriate.
Output ONLY valid JSON, no markdown fences, no preamble.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1000,
        system: systemPrompt,
        messages: [{ role: 'user', content: `Create a game UI component: ${prompt}` }],
      }),
    });

    // Forward the actual Anthropic error so we can debug it
    if (!response.ok) {
      const errText = await response.text();
      console.error('Anthropic error:', response.status, errText);
      return res.status(502).json({ error: `Anthropic ${response.status}: ${errText}` });
    }

    const data = await response.json();
    const raw = data.content.map(b => b.text || '').join('');
    const clean = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

    let parsed;
    try {
      parsed = JSON.parse(clean);
    } catch (parseErr) {
      console.error('JSON parse failed. Raw:', raw);
      return res.status(502).json({ error: 'Model returned invalid JSON — try again.' });
    }

    return res.status(200).json({ html: parsed.html || '', css: parsed.css || '' });

  } catch (err) {
    console.error('Handler error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
