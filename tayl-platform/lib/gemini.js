// Free tier, no credit card required. Get a key at aistudio.google.com/apikey
// Set GEMINI_API_KEY in Vercel env vars.
export async function callGemini(systemPrompt, userMessage) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents: [{ role: 'user', parts: [{ text: userMessage }] }],
    }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || 'Gemini API request failed');

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  return text;
}
