/**
 * AI-powered language conversion using OpenAI API
 * Runs entirely client-side — user supplies their own API key
 */

const API_KEY_STORAGE = 'mcs_openai_api_key';

export function getApiKey() {
  return localStorage.getItem(API_KEY_STORAGE) || '';
}

export async function convertLanguage({ code, fromLang, toLang, onChunk }) {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('NO_API_KEY');
  }
  if (!code.trim()) {
    throw new Error('NO_CODE');
  }

  const systemPrompt = `You are an expert programmer and code translator. Convert the following ${fromLang} code to ${toLang}.
Rules:
- Preserve ALL logic, variable names where possible, and comments (translated to ${toLang} style)
- Use idiomatic ${toLang} patterns and conventions
- Do NOT add explanations or markdown fences — output ONLY the converted code
- Maintain the same structure and functionality exactly
- If a direct translation is impossible, use the closest equivalent in ${toLang}`;

  const userPrompt = `Convert this ${fromLang} code to ${toLang}:\n\n${code}`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      stream: true,
      max_tokens: 8000,
      temperature: 0.1,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    if (response.status === 401) throw new Error('INVALID_API_KEY');
    if (response.status === 429) throw new Error('RATE_LIMIT');
    throw new Error(err?.error?.message || `API error ${response.status}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let fullText = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split('\n').filter(l => l.startsWith('data: '));

    for (const line of lines) {
      const data = line.slice(6);
      if (data === '[DONE]') break;
      try {
        const json = JSON.parse(data);
        const token = json.choices?.[0]?.delta?.content || '';
        if (token) {
          fullText += token;
          onChunk?.(fullText);
        }
      } catch {}
    }
  }

  return fullText;
}
