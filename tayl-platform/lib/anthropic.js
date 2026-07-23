// Set ANTHROPIC_API_KEY in Vercel env vars (from console.anthropic.com > API Keys)
export async function callClaude(systemPrompt, userMessage) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-5',
      max_tokens: 2000,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || 'Claude API request failed');

  const text = data.content?.find((c) => c.type === 'text')?.text || '';
  return text;
}
